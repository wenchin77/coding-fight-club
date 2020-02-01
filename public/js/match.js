const socket = io();
// verify signin first (temp: user name only)
if(!(localStorage.getItem('name'))) {
  window.location.pathname = 'signin'
};

const userName = localStorage.getItem('name');

// 連上以後傳 join 訊息給後端，在後端把用戶加入房間
socket.on('connect', () => {
  socket.emit('join', userName);
});

// 拿到 questionData 顯示在前端
socket.on('questionData', questionObject => {
  document.getElementById('matchQuestion').innerHTML = questionObject.question;
  document.getElementById('question').innerHTML = questionObject.description;
  codemirrorEditor.setValue(questionObject.code);
})


// 接收 codeResult 並顯示（每次都蓋掉上次的）
socket.on('codeResult', (resultObj) =>{
  // 顯示自己的結果在自己的 terminal
  if(resultObj.user === userName) {
    document.getElementById('runCodeResult').innerHTML ='';
    // let node = document.createElement('div');
    // let textnode = document.createTextNode(msg);
    // node.appendChild(textnode);
    // node.id = 'runCodeResult'
    // document.getElementById('runCodeResult').appendChild(node);
    document.getElementById('runCodeResult').innerHTML = msg;
  });
}

function runCode() {  
  // 隱藏 test case
  document.getElementById("testcase").style.display = "none";
  document.getElementById("testcaseBtn").style.background = "#222222";
  // 顯示 run code
  document.getElementById("runCodeResult").style.display = "block";
  document.getElementById("runcodeBtn").style.background = "#555555";

  // get name from localstorage & send to server
  const userName = localStorage.getItem('name');
  // send code & test to server
  const codeareaValue = codemirrorEditor.getValue();
  const testcaseValue = document.getElementById("testcase").value;

  const payload = {
    'name': userName,
    'code': codeareaValue,
    'test': testcaseValue
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
    alert('You exited the match!')
  }
}


