// const socket = io();

function setUpAMatch() {
  // 設定一個 match 的 object 裡面有 match id, user A, user B, question
  // 進入本頁就生出一組 param 讓他可以 send link to invite a friend

  // get name from localstorage & send to server
  const userName = localStorage.getItem('name');
  let opponentName;
  const question = document.getElementById("questionSetup").value;

};


let tempRoomID;

// Temp 測試用
function setUpAMatchTemp() {
  const userName = localStorage.getItem('name');
  const question = document.getElementById("questionSetup").value;

  // redirect to a room in match page (with room id)
  // 暫時以現在的時間代表 room id
  if(!tempRoomID) {
    tempRoomID = timeNowString();
  };
  window.location = `match/${tempRoomID}?question=${question}`;
}


// to be updated
function getLink() {
  tempRoomID = timeNowString();
  document.getElementById('invitationLink').innerHTML = `http://localhost:3000/match/${tempRoomID}`;
};

function timeNowString() {
  let time = new Date();
  let YYYY = time.getFullYear();
  let MM = time.getMonth();
  let DD = time.getDate();
  let HH = time.getHours();
  let mm = time.getMinutes();
  let ss = time.getSeconds();
  let ms = time.getMilliseconds();
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}${ms}`;
};