let socket; // for other pages to use

// to handle invitations across all pages
let invitations = {};

const url = window.location.pathname;
if (!localStorage.getItem("token")) {
  socket = io();
  // count online users at homepage
  if (url === "/") {
    socket.emit("userCount");
    setInterval(() => {
      socket.emit("userCount");
    }, 1000 * 20);
  }
  socket.on("count", userNo => {
    console.log("user no", userNo);
    if (userNo < 2) {
      document.getElementById(
        "userNo"
      ).innerHTML = `${userNo} player online now`;
      return;
    }
    document.getElementById(
      "userNo"
    ).innerHTML = `${userNo} players online now`;
  });
}

// use socket to keep track of online users
if (localStorage.getItem("token") && localStorage.getItem("id")) {
  console.log("socket init...");
  // only init socket when there's a token and userid
  socketInit();
}

function ping(token) {
  socket.emit("online", token);
  if (url === "/") {
    socket.emit("userCount");
  }
}

async function socketInit() {
  socket = io({
    query: {
      token: localStorage.getItem("token")
    }
  });

  // whenever it connects pass the token
  // this is because socketio reconnects itself sometimes and data is lost if we don't pass it when connecting
  let token = localStorage.getItem("token");
  socket.on("connect", () => {
    console.log("socket on connect");
    socket.emit("online", token);
  });

  // setInterval every 20 sec at every page except match page
  if (!url.includes("match/")) {
    ping(token);
    setInterval(() => {
      ping(token);
    }, 1000 * 5);
  };

  socket.on("customError", errorMsg => {
    console.log('socket on error', errorMsg)
    showAlert(errorMsg)
  })

  socket.on("count", userNo => {
    if (url === "/") {
      if (userNo < 2) {
        document.getElementById(
          "userNo"
        ).innerHTML = `${userNo} player online now`;
        return;
      }
      document.getElementById(
        "userNo"
      ).innerHTML = `${userNo} players online now`;
    }
  });

  socket.on("invited", async data => {
    console.log("invited!", data);
    if (url.includes("match/")) {
      console.log("at match page, do not show invitations!");
      return;
    }

    // if it wasn't in invitations{}, add it & show alert
    let inviterName = data.inviterName;
    let inviterId = data.inviter;
    let category = data.category;
    let difficulty = data.difficulty;
    let inviteTime = data.time;

    if (Date.now() - inviteTime > 1000 * 20) {
      console.log(
        "invite timed out, deleting in invitations & emitting rejection..."
      );
      if (invitations[inviteTime]) {
        delete invitations[inviteTime];
      }
      let rejectData = { token, inviterId };
      socket.emit("strangerRejected", rejectData);
      console.log("invitations", invitations);
      return;
    }

    let questionID = await getQuestion(category, difficulty);

    if (!invitations[inviteTime]) {
      console.log("not in invitation before...");
      invitations[inviteTime] = {
        inviterName,
        category,
        difficulty,
        inviterId
      };
      console.log("inviteTime", inviteTime);
      showAlertBox(
        `${inviterName} challenged you to a match of ${difficulty} ${category}!`,
        questionID,
        inviterId
      );
      console.log("invitations", invitations);
    }
  });
}

async function getQuestion(category, difficulty) {
  try {
    const response = await axios.get(
      `/api/${CST.API_VERSION}/question/${category}?difficulty=${difficulty}`
    );
    let questionID = response.data.question.id;
    return questionID;
  } catch (error) {
    console.log(error);
  }
}

async function getKey() {
  let keyObject = await axios.get(`/api/${CST.API_VERSION}/match/get_key`);
  return keyObject.data;
}

// Responsive alert box adjusted from https://codepen.io/takaneichinose/pen/eZoZxv
let AlertBox = function(id, option) {
  this.show = function(msg, questionID, inviterId) {
    if (msg === "" || typeof msg === "undefined" || msg === null) {
      throw '"msg parameter is empty"';
    } else {
      let alertArea = document.querySelector(id);
      let alertBox = document.createElement("DIV");
      let alertContent = document.createElement("DIV");
      let alertClose = document.createElement("A");
      let alertYes = document.createElement("DIV");
      let alertClass = this;
      alertContent.classList.add("alert-content");
      alertContent.innerText = msg;
      alertClose.classList.add("alert-close");
      alertClose.setAttribute("href", "#");
      alertYes.classList.add("alert-yes");
      alertYes.innerText = "ACCEPT";
      alertBox.classList.add("alert-box");
      alertBox.appendChild(alertContent);
      alertBox.appendChild(alertClose);
      alertBox.appendChild(alertYes);
      alertArea.appendChild(alertBox);
      let token = localStorage.getItem("token");
      alertYes.addEventListener("click", async event => {
        event.preventDefault();
        alertClass.hide(alertBox);
        console.log("updated invitations at accept", invitations);
        // create a match
        let matchKey = await getKey();
        let url = `${CST.PROTOCOL}${CST.HOST}/match/${matchKey}`;
        let acceptedData = { url, token, inviterId };
        console.log("acceptedData", acceptedData);
        socket.emit("strangerAccepted", acceptedData);

        // insert a match
        await insertMatch(questionID, matchKey);
        // redirect to a room in match page with match key
        window.location = url;
      });
      alertClose.addEventListener("click", event => {
        event.preventDefault();
        console.log("reject", invitations);
        alertClass.hide(alertBox);
        let rejectData = { token, inviterId };
        socket.emit("strangerRejected", rejectData);
      });
      let alertTimeout = setTimeout(() => {
        alertClass.hide(alertBox);
        clearTimeout(alertTimeout);
        console.log("timeout -> reject", invitations);
        let rejectData = { token, inviterId };
        socket.emit("strangerRejected", rejectData);
      }, option.closeTime);
    }
  };

  this.hide = function(alertBox) {
    alertBox.classList.add("hide");
    let disperseTimeout = setTimeout(() => {
      alertBox.parentNode.removeChild(alertBox);
      clearTimeout(disperseTimeout);
    }, 500);
  };
};

// show for 20 sec
function showAlertBox(msg, questionID, inviterId) {
  let alertbox = new AlertBox("#alert-area", {
    closeTime: 1000 * 20
  });
  alertbox.show(msg, questionID, inviterId);
}

async function insertMatch(questionID, matchKey) {
  try {
    const response = await axios.post(
      `/api/${CST.API_VERSION}/match/insert_match`,
      {
        questionID,
        matchKey
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
}
