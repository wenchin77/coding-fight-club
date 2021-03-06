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
    userID = userProfile.id;

    let matchSummary = await getMatchSummary(userID);
    showMatchResult(userID, matchSummary);
  } catch (err) {
    showAlert('Something went wrong. Refresh the page to view member dashboard.')
    console.log(err)
  }
}

async function getUserInfo (token) {
  try {
    let response = await axios.get(`/api/${CST.API_VERSION}/user/profile?token=${token}`);
    return response.data[0].id;
  } catch (error) {
    console.log(error);
  }
};

async function getMatchSummary (userID) {
  try {
    const response = await axios.get(`/api/${CST.API_VERSION}/match/result/summary?userid=${userID}`)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};



async function showMatchResult (userID, result) {
  if (result.length === 0) {
    document.getElementById('noMatches').innerHTML = 'No match result yet...'
    return;
  }

  let matchResultSummary = [];
  console.log(result)
  // handle each match (2 rows: you & opponent)
  for (let i=0; i<result.length; i+=2) {
    let myIndex;
    let opponent;
    if (result[i].userid === userID) {
      myIndex = i;
      opponent = result[i+1].user_name;
    } else {
      myIndex = i+1;
      opponent = result[i].user_name;
    }
    let question = result[i].question_name;
    let difficulty = result[i].difficulty;
    let category = result[i].category;
    let winnerId = result[i].winner_user_id;
    let points = result[myIndex].points;
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
  addDataToTable('summaryTable', matchResultSummary);

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
    const response = await axios.get(`/api/${CST.API_VERSION}/user/profile?token=${token}`)
    console.log('showProfile data', response.data);
    document.getElementById('username').innerHTML = `Username: ${response.data[0].user_name}`
    document.getElementById('email').innerHTML = `Email: ${response.data[0].email}`
    document.getElementById('points').innerHTML = `Points: ${response.data[0].points}`
    document.getElementById('level').innerHTML = `Level: ${response.data[0].level_name}`;
    if (response.data[0].github_url) {
      document.getElementById('github').innerHTML = `<p>Github URL: <a href='${response.data[0].github_url}'>${response.data[0].github_url}</a></p>`;
    }
    return response.data[0];
  } catch (error) {
    console.log(error);
  }
};




