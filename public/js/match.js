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

// 拿到 questionData 顯示在前端 (once: 只有第一次拿到做，之後不動作)
socket.once('questionData', questionObject => {
  document.getElementById('matchQuestion').innerHTML = questionObject.question;
  document.getElementById('question').innerHTML = questionObject.description;
  codemirrorEditor.setValue(questionObject.code);
})


// 接收 codeResult 並顯示（每次都蓋掉上次的）
socket.on('codeResult', (resultObj) =>{
  console.log(resultObj.user+' 的 codeResult 收到！！')
  // 顯示自己的結果在自己的 terminal
  if(resultObj.user === userName) {
    document.getElementById('runCodeResult').innerHTML = resultObj.result;
    return;
  }
  // 顯示別人的結果在自己的 terminal
  document.getElementById('opponentRunCodeResult').innerHTML = resultObj.result;
});


function runCode() {
  // 隱藏 test case
  document.getElementById("testcase").style.display = "none";
  document.getElementById("testcaseBtn").style.background = "#222222";
  // 顯示 run code
  document.getElementById("runCodeResult").style.display = "block";
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
  document.getElementById("testcase").style.display = "block";
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
