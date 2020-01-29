function getLink() {
  const now = new Date();
  document.getElementById('invitationLink').innerHTML = now.toLocaleTimeString;
};


function setUpAMatch() {
  // 設定一個 match 的 object 裡面有 match id, user A, user B, question
  // 進入本頁就生出一組 param 讓他可以 send link to invite a friend

  // get name from localstorage & send to server
  const userName = localStorage.getItem('name');
  let opponentName;
  const question = document.getElementById("questionSetup").value;

  const payload = {
    'created_at': new Date(),
    'user_1': userName,
    'user_2': opponentName,
    'question': question
  };

  socket.emit('matchObject', payload);

};


