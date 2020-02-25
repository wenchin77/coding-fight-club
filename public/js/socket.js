let socket; // for other pages to use

const url = window.location.pathname;
// use socket to keep track of online users
if (localStorage.getItem('token') && localStorage.getItem('id')){
  console.log('socket init...')
  // only init socket when there's a token and userid
  socketInit();
}

// to handle invitations across all pages
const invitations = {};



function socketInit() {
  socket = io();
  // whenever it connects pass the token
  // this is because socketio reconnects itself sometimes and data is lost if we don't pass it when connecting
  let token = localStorage.getItem('token');
  socket.on('connect', () => {
    console.log('socket on connect')
    socket.emit('online', token);
  });

  // setInterval every 20 sec at every page except match page
  if (!url.includes('match/')) {
    setInterval(() => {
      socket.emit('online', token);
    }, 1000*20);
  };

  socket.on('invited', async (data) => {
    console.log('invited!', data);

    let inviterName = data.inviterName;
    let inviterId = data.inviter;
    let category = data.category;
    let difficulty = data.difficulty;
    let inviteTime = data.time;
    let questionID = await getQuestion(category, difficulty);

    if (url.includes('match/')) {
      console.log('at match page, do not show invitations!')
      return;
    }
    // if it wasn't in invitations{}, add it & show alert
    if (!invitations[inviterId]) {
      console.log('not in invitation before... show alert box');
      invitations[inviterId] = {inviterName, category, difficulty, inviteTime};
      showAlertBox(`${inviterName} challenged you to a match of ${difficulty} ${category}!`,questionID, inviterId);
      console.log('invitations', invitations);
    }
    
  });

}

async function getQuestion(category, difficulty) {
  try {
    const response = await axios.get(`/api/v1/question/${category}?difficulty=${difficulty}`)
    let questionID = response.data.question.id;
    return questionID;
  } catch (error) {
    console.log(error);
  }
};

async function getKey() {
  let keyObject = await axios.post('/api/v1/match/get_key');
  return keyObject.data;
};


// Responsive alert box adjusted from https://codepen.io/takaneichinose/pen/eZoZxv
let AlertBox = function(id, option) {
  this.show = function(msg, questionID, inviterId) {
    if (msg === ''  || typeof msg === 'undefined' || msg === null) {
      throw '"msg parameter is empty"';
    }
    else {
      let alertArea = document.querySelector(id);
      let alertBox = document.createElement('DIV');
      let alertContent = document.createElement('DIV');
      let alertClose = document.createElement('A');
      let alertYes = document.createElement('DIV');
      let alertClass = this;
      alertContent.classList.add('alert-content');
      alertContent.innerText = msg;
      alertClose.classList.add('alert-close');
      alertClose.setAttribute('href', '#');
      alertYes.classList.add('alert-yes');
      alertYes.innerText = 'ACCEPT';
      alertBox.classList.add('alert-box');
      alertBox.appendChild(alertContent);
      alertBox.appendChild(alertClose);
      alertBox.appendChild(alertYes);
      alertArea.appendChild(alertBox);
      let token = localStorage.getItem('token');
      alertYes.addEventListener('click', async (event) => {
        event.preventDefault();
        alertClass.hide(alertBox);
        // delete property from invitations {}
        delete invitations[inviterId];
        console.log('updated invitations at accept', invitations)
        // create a match
        let matchKey = await getKey();
        let url = `https://coding-fight-club.thewenchin.com/match/${matchKey}`;
        let acceptedData = {url, token, inviterId};
        console.log('acceptedData', acceptedData);
        socket.emit('strangerAccepted', acceptedData);
        
        // insert a match
        await insertMatch(questionID, matchKey);
        // redirect to a room in match page with match key
        window.location = url;
      });
      alertClose.addEventListener('click', (event) => {
        event.preventDefault();
        // delete property from invitations {}
        delete invitations[inviterId];
        console.log('updated invitations at reject', invitations)
        alertClass.hide(alertBox);
        let rejectData = {token, inviterId};
        socket.emit('strangerRejected', rejectData);
      });
      let alertTimeout = setTimeout(() => {
        // delete property from invitations {}
        if (invitations[inviterId]) {
          delete invitations[inviterId];
          console.log('updated invitations at timeout', invitations)
        }
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

// show for 20 sec
function showAlertBox(msg, questionID, inviterId) {
  let alertbox = new AlertBox('#alert-area', {
    closeTime: 1000 * 20,
  });
  alertbox.show(msg, questionID, inviterId);
}



async function insertMatch(questionID, matchKey) {
  try {
    const response = await axios.post('/api/v1/match/insert_match', {
      questionID,
      matchKey
    })
    return response;
  } catch (error) {
    console.log(error);
  }
};

