const socket = io();
// print message in FE 
socket.on('codeResult', function(msg){
  console.log("Code Result: ", msg);
  // 每次都蓋掉上次的
  document.getElementById('runCodeResult').innerHTML ='';
  // let node = document.createElement('div');
  // let textnode = document.createTextNode(msg);
  // node.appendChild(textnode);
  // node.id = 'runCodeResult'
  // document.getElementById('runCodeResult').appendChild(node);
  document.getElementById('runCodeResult').innerHTML =msg;
});

function runCode() {
  // 隱藏 test case
  document.getElementById("testcase").style.display = "none";
  document.getElementById("testcaseBtn").style.background = "#222222";
  // 顯示 run code
  document.getElementById("runCodeResult").style.display = "block";
  document.getElementById("runcodeBtn").style.background = "#555555";

  // send code to server
  const codeareaValue = document.getElementById("codearea").value;
  socket.emit('code', codeareaValue);
  // send test case to server
  const testcaseValue = document.getElementById("testcase").value;
  socket.emit('test', testcaseValue);
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
  if (window.confirm('Are you sure you want to exit the match? You will lose if you do so :(')){
    window.location.pathname='/';
    alert('You exited the match!')
  }
}


