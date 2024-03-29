const token = localStorage.getItem("token");
const matchKey = url.substring(url.lastIndexOf("/") + 1);

async function main() {
  try {
    socket.emit('getMatchId', matchKey);
    socket.on('matchId', async matchId => {
      let userID = await getUserInfo(token);
      let matchDetails = await getMatchDetails(matchId, userID);
      console.log("matchDetails", matchDetails);
      showMatchResult(userID, matchDetails);
    });
  } catch (error) {
    console.log(error);
    if (!error.response) {
      showAlert("Server error. Please try again later.");
      return;
    }
    showAlert(error.response.data);
  }
}
main();

async function getUserInfo(token) {
  try {
    let response = await axios.get(
      `/api/${CST.API_VERSION}/user/profile?token=${token}`
    );
    return response.data[0].id;
  } catch (error) {
    console.log(error);
  }
}

async function getPastExecTime(questionID) {
  try {
    const response = await axios.get(
      `/api/${CST.API_VERSION}/match/result/past_performance?questionid=${questionID}`
    );
    return `${parseInt(response.data)} ms`;
  } catch (error) {
    console.log(error);
  }
}

async function getMatchDetails(matchID) {
  try {
    const response = await axios.get(
      `/api/${CST.API_VERSION}/match/result/details?matchid=${matchID}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

function convertAnswerTime(time) {
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

async function showMatchResult(userID, matchResult) {
  console.log("matchResult", matchResult);
  let difficulty = capitalize(matchResult[0].difficulty);
  let category = capitalize(matchResult[0].category);
  let winner = matchResult[0].winner_user_id;
  let myIndex = userID == matchResult[0].user_id ? 0 : 1;
  let opponentIndex = myIndex == 0 ? 1 : 0;
  let winLose;
  console.log("winner", winner);

  if (winner === 0) {
    document.getElementById("winLose").innerHTML = "You Tied!";
    winLose = "Tie";
  } else if (winner === userID) {
    document.getElementById("winLose").innerHTML = "You Won!";
    winLose = "Win";
  } else if (winner === matchResult[opponentIndex].user_id) {
    document.getElementById("winLose").innerHTML = "You Lost!";
    winLose = "Lose";
  } else {
    console.log("This user has no right to view this match");
    showAlert("Wrong match information.", () => {
      window.location.pathname = "/dashboard";
    });
    return;
  }

  let startTime = new Date(matchResult[0].match_start_time);
  let localStartTime = startTime.toLocaleString();

  let matchResultSummary = [
    {
      "Match Time": localStartTime,
      Opponent: matchResult[opponentIndex].user_name,
      Result: winLose,
      Category: category,
      Difficulty: difficulty,
      Question: matchResult[0].question_name,
      Points: matchResult[myIndex].points
    }
  ];

  let pastExecTime = await getPastExecTime(matchResult.question_id);

  let matchResultDetails = [
    {
      Metrics: "Correctness",
      You: matchResult[myIndex].correctness,
      Opponent: matchResult[opponentIndex].correctness
    },
    {
      Metrics: "&nbsp;&nbsp;Small Test Cases",
      You: matchResult[myIndex].small_correctness,
      Opponent: matchResult[opponentIndex].small_correctness
    },
    {
      Metrics: "&nbsp;&nbsp;Large Test Cases",
      You: matchResult[myIndex].large_correctness,
      Opponent: matchResult[opponentIndex].large_correctness
    },
    {
      Metrics: "Performance",
      You: matchResult[myIndex].performance,
      Opponent: matchResult[opponentIndex].performance
    },
    {
      Metrics: "&nbsp;&nbsp;Large Test Cases Performance Check",
      You: matchResult[myIndex].large_passed,
      Opponent: matchResult[opponentIndex].large_passed
    },
    {
      Metrics: "Total Points",
      You: matchResult[myIndex].points,
      Opponent: matchResult[opponentIndex].points
    },
    {
      Metrics: "Answer Time (hh:mm:ss)",
      You: convertAnswerTime(matchResult[myIndex].answer_time),
      Opponent: convertAnswerTime(matchResult[opponentIndex].answer_time)
    }
  ];

  let largeTime = !matchResult[myIndex].large_exec_time
    ? "N/A"
    : `${matchResult[myIndex].large_exec_time} ms`;
  document.getElementById(
    "resultLargeTest"
  ).innerHTML = `Your execution time on large tests is on average ${largeTime}`;
  document.getElementById(
    "resultLargeTestHistoric"
  ).innerHTML = `Historic execution time on large tests is on average ${pastExecTime}`;

  let submittedCode = matchResult[myIndex].answer_code;

  // add data to table
  addDataToTable("summaryTable", matchResultSummary);
  addDataToTable("resultTable", matchResultDetails);

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
      let text = document.createElement("span");
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

function showHelp() {
  showAlert(
    `We evaluate your code based on correctness and performance. <a href='/about#match_result'>Click me</a> to see the details.`
  );
}
