// // send ajax to server every 10 sec to get realtime online users
// const token = localStorage.getItem('token');

// const invitations = {};
// // let unreadNotifications = {};
// let notificationNumber; // if refresh show number before refresh
// if (localStorage.getItem('notificationNumber') > 0) {
//   document.getElementById('notificationNo').style.display = 'block';
//   document.getElementById('notificationNo').innerHTML = notificationNumber;
// }
// console.log('notificationNumber', notificationNumber);

// const ping = async (token) => {

//   let result = await axios.get(`/api/v1/user/ping?token=${token}`);
//   // if there's an invitation display it at the notification bell
//   if (result.data.inviter) {
//     // check if it's in invitations {}
//     if (invitations[result.data.inviter]) {
//       return;
//     }
//     // if not add a no in bell and display it for sometime
//     let inviter = result.data.inviter;
//     let category = result.data.category;
//     let difficulty = result.data.difficulty;
//     invitations[result.data.inviter] = {category, difficulty}
//     console.log('invitations', invitations);
//     document.getElementById('notificationNo').style.display = 'block';
//     if (!notificationNumber) {
//       document.getElementById('notificationNo').innerHTML = 1;
//     } else {
//       notificationNumber ++;
//       localStorage.setItem('notificationNumber', notificationNumber);
//       document.getElementById('notificationNo').innerHTML = notificationNumber;
//     }
//     console.log('notificationNumber', notificationNumber)
//     showAlertBox(`${inviter} challenged you!`);
//   }
// }

// // // 暫時暫停 ping --------------------------
// // setInterval(() => {
// //   ping(token);
// // }, 10000);

// // if someone clicks on the bell, set no back to 0 & display notifications
// function clearNotifications() {
//   document.getElementById('notificationNo').style.display = 'none';
//   localStorage.setItem('notificationNumber', 0);
//   // display notifications
//   // ++++++++++++
// }

// function showAlertBox(msg) {
//   let alertbox = new AlertBox('#alert-area', {
//     closeTime: 10000,
//   });
//   alertbox.show(msg);
// }


// // Responsive alert box adjusted from https://codepen.io/takaneichinose/pen/eZoZxv
// let AlertBox = function(id, option) {
//   this.show = function(msg) {
//     if (msg === ''  || typeof msg === 'undefined' || msg === null) {
//       throw '"msg parameter is empty"';
//     }
//     else {
//       let alertArea = document.querySelector(id);
//       let alertBox = document.createElement('DIV');
//       let alertContent = document.createElement('DIV');
//       let alertClose = document.createElement('A');
//       let alertClass = this;
//       alertContent.classList.add('alert-content');
//       alertContent.innerText = msg;
//       alertClose.classList.add('alert-close');
//       alertClose.setAttribute('href', '#');
//       alertBox.classList.add('alert-box');
//       alertBox.appendChild(alertContent);
//       alertBox.appendChild(alertClose);
//       alertArea.appendChild(alertBox);
//       alertClose.addEventListener('click', (event) => {
//         event.preventDefault();
//         alertClass.hide(alertBox);
//       });
//       let alertTimeout = setTimeout(() => {
//         alertClass.hide(alertBox);
//         clearTimeout(alertTimeout);
//       }, option.closeTime);
//     }
//   };

//   this.hide = function(alertBox) {
//     alertBox.classList.add('hide');
//     let disperseTimeout = setTimeout(() => {
//       alertBox.parentNode.removeChild(alertBox);
//       clearTimeout(disperseTimeout);
//     }, 500);
//   };
// };


