const token = localStorage.getItem('token');

// get matchID
const url = window.location.pathname;
const matchKey = url.substring(url.lastIndexOf('/') + 1);



const getUserInfo =  async (token) => {
  try {
    let response = await axios.post(`/api/v1/user/get_userInfo?token=${token}`);
    console.log(response.data[0].id)
    return response.data[0].id;
  } catch (error) {
    console.log(error);
  }
};


const getMatchID =  async (matchKey) => {
  try {
    let response = await axios.post(`/api/v1/match/get_matchid?matchkey=${matchKey}`)
    let matchID = response.data;
    return matchID;
  } catch (error) {
    console.log(error);
  }
};

const getPastExecTime =  async (questionID) => {
  try {
    const response = await axios.post(`/api/v1/match/result/past_performance?questionid=${questionID}`)
    return `${parseInt(response.data)} ms`;
  } catch (error) {
    console.log(error);
  }
};


const getMatchDetails =  async (matchID, userID) => {
  try {
    const response = await axios.post(`/api/v1/match/result/details?userid=${userID}&matchid=${matchID}`)
    console.log('match detail data===', response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
};




const capitalize = (str) => {
  if (typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const convertAnswerTime = (time) => {   
  // Hours, minutes and seconds
  var hrs = Math.floor(time / 3600);
  var mins = Math.floor((time % 3600) / 60);
  var secs = Math.floor(time % 60);
  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";
  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  } else {
    ret += "00:" + (mins < 10 ? "0" : "");
  }
  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}


const showMatchResult = async (userID, result) => {
  let matchResult = result.matchResult;
  let question = result.question;
  let winner = matchResult[0].winner_user_id;
  let myIndex = ((userID == matchResult[0].user_id) ? 0 : 1);
  let opponentIndex = ((myIndex == 0) ? 1 : 0);
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
    {'Match Time': localStartTime, Opponent: matchResult[opponentIndex].user_name, Result: winLose, Topic: capitalize(question.category), Difficulty: capitalize(question.difficulty), Question: question.question_name}
  ]

  let pastExecTime = await getPastExecTime(question.id);

  let matchResultDetails = [
    {Metrics: 'Correctness', You: matchResult[myIndex].correctness, Opponent: matchResult[opponentIndex].correctness},
    {Metrics: '&nbsp;&nbsp;Small Test Cases', You: matchResult[myIndex].small_correctness, Opponent: matchResult[opponentIndex].small_correctness},
    {Metrics: '&nbsp;&nbsp;Large Test Cases', You: matchResult[myIndex].large_correctness, Opponent: matchResult[opponentIndex].large_correctness},
    {Metrics: 'Performance', You: matchResult[myIndex].performance, Opponent: matchResult[opponentIndex].performance},
    {Metrics: '&nbsp;&nbsp;Large Test Cases Performance Check', You: matchResult[myIndex].large_passed, Opponent: matchResult[opponentIndex].large_passed},
    {Metrics: 'Total Points', You: matchResult[myIndex].points, Opponent: matchResult[opponentIndex].points},
    {Metrics: 'Answer Time (hh:mm:ss)', You: convertAnswerTime(matchResult[myIndex].answer_time), Opponent: convertAnswerTime(matchResult[opponentIndex].answer_time)},
  ];

  let largeTime = ((!matchResult[myIndex].large_exec_time) ? 'N/A': `${matchResult[myIndex].large_exec_time} ms`)
  document.getElementById('resultLargeTest').innerHTML = `Your execution time on large tests is on average ${largeTime}`
  document.getElementById('resultLargeTestHistoric').innerHTML = `Historic execution time on large tests is on average ${pastExecTime}`

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


async function main() {
  let userID = await getUserInfo(token);
  // let username = userInfo.user_name;
  console.log('userid', userID)

  let matchID = await getMatchID(matchKey);
  let matchDetails = await getMatchDetails(matchID, userID);
  showMatchResult(userID, matchDetails);
}
main();




