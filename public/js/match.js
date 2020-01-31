const socket = io();
let matches = [];

// verify signin first
if(!(localStorage.getItem('name'))) {
  window.location.pathname = 'signin'
};

const userName = localStorage.getItem('name');

// 傳給後端，在後端把用戶加入房間
socket.on('connect', () => {
  socket.emit('join', userName);
})

socket.on('match', (roomID) => {
  matches.push(roomID);
})

// 接收 codeResult 並顯示（每次都蓋掉上次的）
socket.on('codeResult', (msg) =>{
  console.log('前端拿到 code result');
  document.getElementById('runCodeResult').innerHTML ='';
  document.getElementById('runCodeResult').innerHTML = msg;
  console.log('matches: ', matches);
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
    name: userName,
    code: codeareaValue,
    test: testcaseValue
  };
  console.log(payload);
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
    socket.emit('exit');
  }
}

function submitCode() {
  // 第一個結束的人紀錄扣跟項目評分在 match_detail
  // 第二個結束的人紀錄扣跟項目評分在 match_detail 和紀錄結束時間、贏家跟分數在 match
  // 更新兩人的 user table (and level table if needed)

}
