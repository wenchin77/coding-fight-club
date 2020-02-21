// verify signin first
if (!localStorage.getItem("token")) {
  window.location.pathname = "signin";
}

const token = localStorage.getItem('token');
let userID;

main();

async function main() {
  let userProfile = await showProfile(token);
  userID = userProfile.id;
  console.log('userID in main', userID)

  let matchSummary = await getMatchSummary(userID);
  console.log(matchSummary)
  // showMatchResult(userID, matchSummary);
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
    const response = await axios.post(`/api/v1/match/result/summary?userid=${userID}`)
    console.log('match detail data===', response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};



function capitalize (str) {
  if (typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// TO BE UPDATED +++++++++++++ (要多拉對手資料)
async function showMatchResult (userID, result) {
  let myIndex = ((userID == result[0].user_id) ? 0 : 1);
  let opponentIndex = ((myIndex == 0) ? 1 : 0);
  
  let question = result[0].question_name;
  let difficulty = result[0].difficulty;
  let category = result[0].category;
  let winner = result[0].winner_user_id;
  
  let winLose;

  if (!winner) {
    document.getElementById("winLose").innerHTML = 'You Tied!';
    winLose = 'Tie'
  } else if (userID == winner) {
    document.getElementById("winLose").innerHTML = 'You Won!';
    winLose = 'Win'
  } else {
    document.getElementById("winLose").innerHTML = 'You Lost!';
    winLose = 'Lose'
  }

  let startTime = new Date(matchResult[0].match_start_time)
  let localStartTime = startTime.toLocaleString()

  let matchResultSummary = [
    {
      'Match Time': localStartTime, 
      Opponent: matchResult[opponentIndex].user_name, 
      Result: winLose, 
      Topic: capitalize(question.category), 
      Difficulty: capitalize(question.difficulty), 
      Question: question.question_name,
      Points: matchResult[myIndex].points
    }
  ]

  console.log(matchResultSummary)

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
    console.log('match detail data===', response.data);
    document.getElementById('username').innerHTML = `Username: ${response.data[0].user_name}`
    document.getElementById('email').innerHTML = `Email: ${response.data[0].email}`
    document.getElementById('points').innerHTML = `Points: ${response.data[0].points}`
    document.getElementById('level').innerHTML = `Level: ${response.data[0].level_name}`;
    return response.data[0];
  } catch (error) {
    console.log(error);
  }
};




