const socket = io();

// verify signin first
if(!(localStorage.getItem('name'))) {
  window.location.pathname = 'signin';
};

const userID = localStorage.getItem('name');

// 把要跑程式需要的這些東西存在前端，跑 runCode 時丟到後面
let sampleCaseExpected;
let questionConst;
let difficulty;

// 連上以後傳 join 訊息給後端，在後端把用戶加入房間
socket.on('connect', () => {
  if (userID) { // prevent null
    socket.emit('join', userID);
  }
  // +++++++++ check if the match's on, if so get start time from server to set the timer
});

// too many people in a match: reject and redirect
socket.on('rejectUser', msg => {
  window.alert(msg);
  window.location = '/';
})

// 拿到 questionData 顯示在前端 (once: 只有第一次拿到做，之後不動作)
socket.once('questionData', questionObject => {
  document.getElementById('matchQuestion').innerHTML = questionObject.question;
  document.getElementById('question').innerHTML = `<p id="questionDescription">${questionObject.description}</p>`;
  document.getElementById('sampleTestCase').innerHTML = questionObject.sampleCase;
  codemirrorEditor.setValue(questionObject.code);
  sampleCaseExpected = questionObject.sampleExpected;
  questionConst = questionObject.const;
  difficulty = questionObject.difficulty;
});

socket.once('waitForOpponent', msg => {
  document.getElementById('runCodeOutput').innerHTML = '<p id="terminalMessage">Hold on. We are waiting for your opponent to join...</p>';
})

socket.on('joinLeaveMessage', msgObject => {
  // opponent joins / leaves
  if(msgObject.user !== userID) {
    document.getElementById('opponentRunCodeOutput').innerHTML = `<p id="terminalMessage">${msgObject.message}</p>`;
  }
});

socket.once('startMatch', users => {
  // show opponent name
  let opponent;
  if (users.user1 === userID) {
    opponent = users.user2
  } else {
    opponent = users.user1
  }
  document.getElementById('opponent').innerHTML = `Opponent: ${opponent}`;
  
  // show start match message
  document.getElementById('runCodeOutput').innerHTML = '<p id="terminalMessage">The match begins now! Write the code and test cases to begin.</p>'

  // start the timer
  let hoursLabel = document.getElementById("hours");
  let minutesLabel = document.getElementById("minutes");
  let secondsLabel = document.getElementById("seconds");
  let totalSeconds = 0;
  setInterval(setTime(totalSeconds, hoursLabel, minutesLabel, secondsLabel), 1000);
})


// 接收 codeResult 並顯示（每次都蓋掉上次的）
socket.on('codeResult', (resultObj) =>{
  // 顯示自己的結果在自己的 terminal
  if(resultObj.user === userID) {
    document.getElementById('runCodeOutput').innerHTML = '';
    document.getElementById('runCodeOutput').innerHTML = resultObj.output;
    return;
  }
  // 顯示別人的結果在自己的 terminal
  document.getElementById('opponentRunCodeOutput').innerHTML = resultObj.output;
});

socket.once('waitForMatchEnd', submitMessage => {
  console.log('waitForMatchEnd')
  if (submitMessage.user === userID) {
    window.alert(`Awesome! Here's your submit result: \n\n${submitMessage.testCasesResult}Let's wait for your opponent to submit.`);
    // 等待的時候可以幹啥？
    return;
  }
  document.getElementById('opponentRunCodeOutput').innerHTML = `<p id="terminalMessage">${submitMessage.message}</p>`;

})

socket.once('testCasesResult', testCasesResult => {
  window.alert(`Here's your submit result:\n${testCasesResult}`)
})

socket.once('endMatch', (matchKey, checkWinnerResult) => {
  let winner = checkWinnerResult.winner;
  localStorage.setItem('winner', winner)
  if (userID == checkWinnerResult.result_0.user) {
    localStorage.setItem('correctness', checkWinnerResult.result_0.correctness)
    localStorage.setItem('performance', checkWinnerResult.result_0.performance)
    localStorage.setItem('answerTime', checkWinnerResult.result_0.answerTime)
    localStorage.setItem('points', checkWinnerResult.result_0.points)
  } else {
    localStorage.setItem('correctness', checkWinnerResult.result_1.correctness)
    localStorage.setItem('performance', checkWinnerResult.result_1.performance)
    localStorage.setItem('answerTime', checkWinnerResult.result_1.answerTime)
    localStorage.setItem('points', checkWinnerResult.result_1.points)  }
  // temp: change to ajax later ++++++++++++
  localStorage.setItem('match', checkWinnerResult);
  // redirect to match_result page with match_key param
  window.location = `/match_result/${matchKey}`;
})


function setTime(totalSeconds, hoursLabel, minutesLabel, secondsLabel) {
  return () => {
    totalSeconds = totalSeconds + 1;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt((totalSeconds % 3600) / 60));
    hoursLabel.innerHTML = pad(parseInt(totalSeconds / 3600))
  }
};

function pad(val) {
  let valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}


function runCode() {
  // 隱藏 test case
  document.getElementById("testCaseArea").style.display = "none";
  document.getElementById("testcaseBtn").style.background = "#222222";
  // 顯示 run code
  document.getElementById("runCodeOutput").style.display = "flex";
  document.getElementById("runcodeBtn").style.background = "#555555";

  // send code & test to server
  let codeareaValue = codemirrorEditor.getValue();
  let sampleTestCase = document.getElementById("sampleTestCase").textContent;
  let testcaseValue = document.getElementById("testcase").value;
  testcaseValue = sampleTestCase +'\n'+ testcaseValue;

  let payload = {
    user: userID,
    code: codeareaValue,
    test: testcaseValue,
    difficulty,
    questionConst,
    sampleCaseExpected
  };
  socket.emit('codeObject', payload);

};


function submitCode() {
  if (window.confirm('Are you sure? You can only submit once')) {
    // send code to server (get test cases in server)
    let codeareaValue = codemirrorEditor.getValue();
    let payload = {
      user: userID,
      code: codeareaValue,
      difficulty
    };
    socket.emit('submit', payload);
  }
}



function showTestCase() {
  // 顯示 test case
  document.getElementById("testCaseArea").style.display = "flex";
  document.getElementById("testcaseBtn").style.background = "#555555";
  // 隱藏 run code
  document.getElementById("runCodeOutput").style.display = "none";
  document.getElementById("runcodeBtn").style.background = "#222222";
}

function exitMatch() {
  if (window.confirm('Are you sure you want to exit the match? You will not gain any points if you do so :(')){
    window.location.pathname='/';
    alert('You exited the match!');
    socket.emit('exit', userID);
  }
}


function showHelp() {
  // show help message
}




