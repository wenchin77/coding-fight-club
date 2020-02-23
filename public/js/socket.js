let socket; // for other pages to use

// use socket to keep track of online users
if (localStorage.getItem('token') && localStorage.getItem('id')){
  console.log('socket init...')
  // only init socket when there's a token and userid
  socketInit();
}

const invitations = {};
// let unreadNotifications = {};
let notificationNumber = 0; // if refresh show number before refresh
if (localStorage.getItem('notificationNumber') > 0) {
  document.getElementById('notificationNo').style.display = 'block';
  document.getElementById('notificationNo').innerHTML = notificationNumber;
}
console.log('notificationNumber', notificationNumber);


function socketInit() {
  socket = io();
  let token = localStorage.getItem('token');
  // whenever it connects pass the token
  // this is because socketio reconnects itself sometimes and data is lost if we don't pass it when connecting
  socket.on('connect', () => {
    console.log('socket on connect')
    // setInterval 每幾秒發一次? ++++++++++++++++++++
    setInterval(() => {
      socket.emit('online', token);
    }, 1000*30);
  })

  socket.on('invited', (data) => {
    console.log('invited data', data);

    let inviter = data.inviter;
    let category = data.category;
    let difficulty = data.difficulty;
    
    // if it wasn't in invitations{}, add it and add notificationNumber
    if (!invitations[inviter]) {
      console.log('not in invitation before')
      invitations[inviter] = {category, difficulty};
      console.log('invitations', invitations);
      document.getElementById('notificationNo').style.display = 'block';
      
      notificationNumber ++;
      localStorage.setItem('notificationNumber', notificationNumber);
      document.getElementById('notificationNo').innerHTML = notificationNumber;
  
      console.log('notificationNumber', notificationNumber)
      showAlertBox(`${inviter} challenged you!`);
    }
    
  })


  
}


// if someone clicks on the bell, set no back to 0 & display notifications
function clearNotifications() {
  document.getElementById('notificationNo').style.display = 'none';
  localStorage.setItem('notificationNumber', 0);
  // display notifications
  // ++++++++++++
}

// show for 5 sec
function showAlertBox(msg) {
  let alertbox = new AlertBox('#alert-area', {
    closeTime: 5000,
  });
  alertbox.show(msg);
}

// Responsive alert box adjusted from https://codepen.io/takaneichinose/pen/eZoZxv
let AlertBox = function(id, option) {
  this.show = function(msg) {
    if (msg === ''  || typeof msg === 'undefined' || msg === null) {
      throw '"msg parameter is empty"';
    }
    else {
      let alertArea = document.querySelector(id);
      let alertBox = document.createElement('DIV');
      let alertContent = document.createElement('DIV');
      let alertClose = document.createElement('A');
      let alertClass = this;
      alertContent.classList.add('alert-content');
      alertContent.innerText = msg;
      alertClose.classList.add('alert-close');
      alertClose.setAttribute('href', '#');
      alertBox.classList.add('alert-box');
      alertBox.appendChild(alertContent);
      alertBox.appendChild(alertClose);
      alertArea.appendChild(alertBox);
      alertClose.addEventListener('click', (event) => {
        event.preventDefault();
        alertClass.hide(alertBox);
      });
      let alertTimeout = setTimeout(() => {
        alertClass.hide(alertBox);
        clearTimeout(alertTimeout);
      }, option.closeTime);
    }
  };

  this.hide = function(alertBox) {
    alertBox.classList.add('hide');
    let disperseTimeout = setTimeout(() => {
      alertBox.parentNode.removeChild(alertBox);
      clearTimeout(disperseTimeout);
    }, 500);
  };
};


