// verify signin first
if (!localStorage.getItem("token")) {
  window.location.pathname = "signin";
}

const token = localStorage.getItem('token');
let userID;

main();

async function main() {
  try {
    let userProfile = await showProfile(token);
    console.log('userProfile', userProfile)
    userID = userProfile.id;

    let matchSummary = await getMatchSummary(userID);
    console.log('matchSummary', matchSummary)
    showMatchResult(userID, matchSummary);
  } catch (err) {
    showAlert('Something went wrong. Refresh the page to view member dashboard.')
    console.log(err)
  }
}

async function getUserInfo (token) {
  try {
    let response = await axios.post(`/api/${CST.API_VERSION}/user/get_user_info?token=${token}`);
    return response.data[0].id;
  } catch (error) {
    console.log(error);
  }
};

async function getMatchSummary (userID) {
  try {
    const response = await axios.get(`/api/${CST.API_VERSION}/match/result/all?userid=${userID}`)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};


// ++++++++++++ add paging
async function showMatchResult (userID, result) {
  console.log(result)
  if (result.length === 0) {
    console.log('no matches found')
    document.getElementById('noMatches').innerHTML = 'No match result yet...'
    return;
  }

  let matchResultSummary = [];
  // handle each match (2 rows: you & opponent)
  for (let i=0; i<result.length; i+=2) {
    let opponent;
    if (result[i].userid === userID) {
      opponent = result[i+1].user_name;
    } else {
      opponent = result[i].user_name;
    }
    console.log('opponent', opponent)
    let question = result[i].question_name;
    let difficulty = result[i].difficulty;
    let category = result[i].category;
    let winnerId = result[i].winner_user_id;
    let points = result[i].points;
    let matchKey = result[i].match_key;
    let url = `${CST.PROTOCOL}${CST.HOST}/match_result/${matchKey}`
    let winLose;
    if (winnerId === 0) {
      winLose = 'Tie'
    } else if (userID == winnerId) {
      winLose = 'Win';
    } else {
      winLose = 'Lose'
    };
    let startTime = new Date(result[i].match_start_time)
    let localStartTime = startTime.toLocaleString();

    let matchResult = 
      {
        'Match Time': localStartTime, 
        Opponent: opponent,
        Result: winLose, 
        Category: capitalize(category), 
        Difficulty: capitalize(difficulty), 
        Question: question,
        Points: points,
        url
      };
    matchResultSummary.push(matchResult);
  }

  console.log(matchResultSummary);
  // add data to table
  addDataToTable('allMatchesTable', matchResultSummary);

}

function addDataToTable(elementId, array) {
  let table = document.getElementById(elementId);
  let data = Object.keys(array[0]);
  generateTableHead(table, data);
  generateTable(table, array);
}


function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    if (key !== 'url') {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    row.setAttribute('onclick',`window.document.location='${element.url}'`);
    for (key in element) {
      if (key !== 'url'){
        let cell = row.insertCell();
        let text = document.createElement('span');
        text.innerHTML = element[key];
        cell.appendChild(text);
      }
    }
  }
}




async function showProfile(token) {
  try {
    const response = await axios.post(`/api/${CST.API_VERSION}/user/get_user_info?token=${token}`)
    return response.data[0];
  } catch (error) {
    console.log(error);
  }
};




