const socket = io();

// verify signin first
if(!(localStorage.getItem('name'))) {
  window.location.pathname = 'signin';
};

const userName = localStorage.getItem('name');
let sampleCaseExpected;

// 連上以後傳 join 訊息給後端，在後端把用戶加入房間
socket.on('connect', () => {
  if (userName) {
    socket.emit('join', userName);
  }
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
});

socket.once('waitForOpponent', msg => {
  document.getElementById('runCodeOutput').innerHTML = `<p id="terminalMessage">${msg}</p>`;
})

socket.on('joinLeaveMessage', msgObject => {
  // opponent joins / leaves
  if(msgObject.user !== userName) {
    document.getElementById('opponentRunCodeOutput').innerHTML = `<p id="terminalMessage">${msgObject.message}</p>`;
  }
});

socket.once('startMatch', users => {
  // show opponent name
  let opponent;
  if (users.user1 === userName) {
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
  console.log(resultObj);
  // 顯示自己的結果在自己的 terminal
  if(resultObj.user === userName) {
    document.getElementById('runCodeOutput').innerHTML = '';
    document.getElementById('runCodeOutput').innerHTML = resultObj.output;
    return;
  }
  // 顯示別人的結果在自己的 terminal
  document.getElementById('opponentRunCodeOutput').innerHTML = resultObj.output;
});


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
    user: userName,
    code: codeareaValue,
    test: testcaseValue,
    sampleCaseExpected
  };
  socket.emit('codeObject', payload);

};




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
    socket.emit('exit', userName);
  }
}

function submitCode() {
  // code???
  socket.emit('submit', code);

  // 第一個結束的人紀錄扣跟項目評分在 match_detail
  // 第二個結束的人紀錄扣跟項目評分在 match_detail 和紀錄結束時間、贏家跟分數在 match
  // 更新兩人的 user table (and level table if needed)

}


