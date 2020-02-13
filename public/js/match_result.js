const userID = localStorage.getItem('name');

// get matchID
const url = window.location.pathname;
const matchKey = url.substring(url.lastIndexOf('/') + 1);

const getMatchID =  async (matchKey) => {
  try {
    let response = await axios.post(`/api/v1/match/get_matchid?matchkey=${matchKey}`)
    let matchID = response.data;
    return matchID;
  } catch (error) {
    console.log(error);
  }
};


const getMatchDetails =  async (matchID, userID) => {
  try {
    const response = await axios.post(`/api/v1/match/result/details?userid=${userID}&matchid=${matchID}`)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};


const capitalize = (str) => {
  if (typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}



const showMatchResult = (result) => {
  let matchResult = result.matchResult;
  let question = result.question;
  let winner = matchResult[0].winner_user_id;
  let myIndex = ((userID == matchResult[0].user_id) ? 0 : 1);
  let opponentIndex = ((myIndex == 0) ? 1 : 0);
  
  if (!winner) {
    document.getElementById("winLose").innerHTML = 'You Tied!';
  } else if (userID == winner) {
    document.getElementById("winLose").innerHTML = 'You Won!';
  } else {
    document.getElementById("winLose").innerHTML = 'You Lost!';
  }

  let startTime = new Date(matchResult[0].match_start_time)
  let localStartTime = startTime.toLocaleString()

  let matchResultSummary = [
    {Topic: capitalize(question.category), Difficulty: capitalize(question.difficulty), Question: question.question_name, 'Match Time': localStartTime, Opponent: matchResult[opponentIndex].user_id}
  ]

  let matchResultDetails = [
    {'': 'Correctness', You: matchResult[myIndex].correctness, Opponent: matchResult[opponentIndex].correctness},
    {'': '| Small Test Cases Correctness', You: matchResult[myIndex].small_correctness, Opponent: matchResult[opponentIndex].small_correctness},
    {'': '| Large Test Cases Correctness', You: matchResult[myIndex].large_correctness, Opponent: matchResult[opponentIndex].large_correctness},
    {'': 'Performance', You: matchResult[myIndex].performance, Opponent: matchResult[opponentIndex].performance},
    {'': 'Total Points', You: matchResult[myIndex].points, Opponent: matchResult[opponentIndex].points},
    {'': 'Answer Time', You: matchResult[myIndex].answer_time, Opponent: matchResult[opponentIndex].answer_time},
  ];

  let submittedCode = matchResult[myIndex].answer_code;

  // add data to table
  addDataToTable('summaryTable', matchResultSummary);
  addDataToTable('resultTable', matchResultDetails);

  // add code (readOnly in CodeMirror)
  codemirrorEditor.setValue(submittedCode);

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
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

function addDataToTable(id, array) {
  let table = document.getElementById(id);
  let data = Object.keys(array[0]);
  generateTableHead(table, data);
  generateTable(table, array);
}








async function main() {
  let matchID = await getMatchID(matchKey);
  let matchDetails = await getMatchDetails(matchID, userID);
  showMatchResult(matchDetails);
}
main();




