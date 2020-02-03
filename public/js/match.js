const socket = io();

// verify signin first
if(!(localStorage.getItem('name'))) {
  window.location.pathname = 'signin'
};

const userName = localStorage.getItem('name');

// 連上以後傳 join 訊息給後端，在後端把用戶加入房間
socket.on('connect', () => {
  console.log(userName + ' 的 socket on connect 了！！！！')
  socket.emit('join', userName);
});

// too many people in a match: reject and redirect
socket.on('rejectUser', (msg) => {
  window.alert(msg);
  window.location = '/';
})

// 拿到 questionData 顯示在前端 (once: 只有第一次拿到做，之後不動作)
socket.once('questionData', questionObject => {
  document.getElementById('matchQuestion').innerHTML = questionObject.question;
  document.getElementById('question').innerHTML = questionObject.description;
  codemirrorEditor.setValue(questionObject.code);
});

socket.on('waitForOpponent', msg => {
  // window.alert(msg);
  document.getElementById('runCodeResult').innerHTML = msg;
  // let node = document.createElement('p');
  // node.prepend(document.createTextNode(msg);
  // document.getElementById('terminalResult').innerHTML = node;
})

// socket.on('inOutMessage', (msgObject) => {
//   // 自己加入：自己 terminal 顯示等待對手訊息
//   if(msgObject.user === userName) {
//     // let node = document.createElement('p');
//     // node.appendChild(document.createTextNode('Hold on. We are waiting for your opponent to join...'))
//     document.getElementById('runCodeResult').innerHTML = 'Hold on. We are still waiting for your opponent to join...';
//     return;
//   }
//   // 對手加入：自己 terminal 放入兩個 div 讓用戶開始寫
//   document.getElementById('opponentRunCodeResult').innerHTML = msgObject.message;
//   node = document.getElementById('runCodeResult');
//   let runCodeOutput = document.createElement('div');
//   runCodeOutput.id = runCodeOutput;
//   let runCodeExpected = document.createElement('div');
//   runCodeExpected.id = runCodeExpected;
//   node.appendChild(runCodeOutput);
//   node.appendChild(runCodeExpected);
// })


// 接收 codeResult 並顯示（每次都蓋掉上次的）
socket.on('codeResult', (resultObj) =>{
  console.log(resultObj);
  // 顯示自己的結果在自己的 terminal
  if(resultObj.user === userName) {
    document.getElementById('runCodeOutput').innerHTML = resultObj.output;
    document.getElementById('runCodeExpected').innerHTML = resultObj.expected;
    return;
  }
  // 顯示別人的結果在自己的 terminal
  document.getElementById('opponentRunCodeOutput').innerHTML = resultObj.output;
  document.getElementById('opponentRunCodeExpected').innerHTML = resultObj.expected;
});


function runCode() {
  // 隱藏 test case
  document.getElementById("testcase").style.display = "none";
  document.getElementById("testcaseBtn").style.background = "#222222";
  // 顯示 run code
  document.getElementById("runCodeResult").style.display = "flex";
  document.getElementById("runcodeBtn").style.background = "#555555";

  // send code & test to server
  const codeareaValue = codemirrorEditor.getValue();
  const testcaseValue = document.getElementById("testcase").value;

  let payload = {
    user: userName,
    code: codeareaValue,
    test: testcaseValue
  };
  socket.emit('codeObject', payload);

};




function showTestCase() {
  // 顯示 test case
  document.getElementById("testcase").style.display = "flex";
  document.getElementById("testcaseBtn").style.background = "#555555";
  // 隱藏 run code
  document.getElementById("runCodeResult").style.display = "none";
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
  // 第一個結束的人紀錄扣跟項目評分在 match_detail
  // 第二個結束的人紀錄扣跟項目評分在 match_detail 和紀錄結束時間、贏家跟分數在 match
  // 更新兩人的 user table (and level table if needed)

}
