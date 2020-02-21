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
    console.log('matchSummary', matchSummary)
    showMatchResult(userID, matchSummary);
  } catch (err) {
    showAlert('Something went wrong. Refresh the page to see result.')
    console.log(err)
  }
}

async function getUserInfo (token) {
  try {
    let response = await axios.post(`/api/v1/user/get_user_info?token=${token}`);
    return response.data[0].id;
  } catch (error) {
    console.log(error);
  }
};

// TO BE UPDATED +++++++++++++ print out in a table
async function getMatchSummary (userID) {
  try {
    const response = await axios.get(`/api/v1/match/result/summary?userid=${userID}`)
    console.log('getMatchSummary data', response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};



function capitalize (str) {
  if (typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function showMatchResult (userID, result) {
  let matchResultSummary = [];
  let length = (result.length<=5) ? result.length : 5;
  // show latest 5 matches
  for (let i=0; i<length; i++) {
    console.log(result[i])
    let question = result[i].question_name;
    let difficulty = result[i].difficulty;
    let category = result[i].category;
    let winnerId = result[i].winner_id;
    let points = result[i].points
    let opponent = (result[i].winner_id === userID) ? result[i].loser_name : result[i].winner_name;
    
    let winLose;
    if (winnerId === 'tie') {
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
        Points: points
      };
    matchResultSummary.push(matchResult);
  }
  console.log(matchResultSummary);
  // add data to table
  addDataToTable('summaryTable', matchResultSummary);

}

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createElement('span');
      text.innerHTML = element[key];
      cell.appendChild(text);
    }
  }
}

function addDataToTable(elementId, array) {
  let table = document.getElementById(elementId);
  let data = Object.keys(array[0]);
  generateTableHead(table, data);
  generateTable(table, array);
}



async function showProfile(token) {
  try {
    const response = await axios.post(`/api/v1/user/get_user_info?token=${token}`)
    console.log('showProfile data', response.data);
    document.getElementById('username').innerHTML = `Username: ${response.data[0].user_name}`
    document.getElementById('email').innerHTML = `Email: ${response.data[0].email}`
    document.getElementById('points').innerHTML = `Points: ${response.data[0].points}`
    document.getElementById('level').innerHTML = `Level: ${response.data[0].level_name}`;
    return response.data[0];
  } catch (error) {
    console.log(error);
  }
};




