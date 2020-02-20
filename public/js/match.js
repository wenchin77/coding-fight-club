let socket;

// verify signin first
if (!localStorage.getItem("token")) {
  window.location.pathname = "signin";
}

let userID;
let username;
let opponent;
let sampleCaseExpected;
let questionConst;
let difficulty;

socketInit();

// socket init
function socketInit() {

  socket = io();

  // 連上以後傳 join 訊息給後端，在後端把用戶加入房間
  socket.on("connect", () => {
    let token = localStorage.getItem("token");
    console.log(token)
    socket.emit("join", token);
    // +++++++++ check if the match's on, if so get start time from server to set the timer
  });

  socket.on('userData', data => {
    userID = data.userid;
    username = data.username;
  });
  console.log('userID', userID);
  console.log('username', username);

  // can't find user
  socket.on("noUserFound", msg => {
    showAlert(msg, () => {
      window.location = "/signin";
    });
  });

  // too many people in a match: reject and redirect
  socket.on("rejectUser", msg => {
    showAlert(msg, () => {
      window.location = "/match_setup";
    });
  });

  // submitted already
  socket.on("alreadySubmitted", () => {
    showAlert(
      "You already submitted your code in this match. Let's wait a bit for your opponent to submit too!"
    );
  });

  // 拿到 questionData 顯示在前端 (once: 只有第一次拿到做，之後不動作)
  socket.once("questionData", questionObject => {
    document.getElementById("matchQuestion").innerHTML = questionObject.question;
    document.getElementById("question").innerHTML = `<p id="questionDescription">${questionObject.description}</p>`;
    document.getElementById("sampleTestCase").innerHTML = questionObject.sampleCase;
    codemirrorEditor.setValue(questionObject.code);
    sampleCaseExpected = questionObject.sampleExpected;
    questionConst = questionObject.const;
    difficulty = questionObject.difficulty;
  });

  socket.once("waitForOpponent", msg => {
    showAlert(msg, () => {
      document.getElementById("runCodeOutput").innerHTML =
        '<p id="terminalMessage">Hold on. You will be able to read the question and code right after your opponent joins.</p>';
    });
  });

  socket.on("joinLeaveMessage", msgObject => {
    // opponent joins / leaves
    if (msgObject.user !== userID) {
      document.getElementById("opponentRunCodeOutput").innerHTML = `<p id="terminalMessage">${msgObject.message}</p>`;
    }
  });

  socket.once("startMatch", users => {
    console.log(users)
    // show opponent name
    console.log('users.user1.user',users.user1.user);
    console.log('userID', userID);
    opponent = (users.user1.user === userID) ? users.user2.username : users.user1.username;
    console.log('opponent',opponent)
    // show start match message
    showAlert(`The match against ${opponent} begins now!`, () => {
      document.getElementById("opponent").innerHTML = `Opponent: ${opponent}`;
      document.getElementById("runCodeOutput").innerHTML =
        '<p id="terminalMessage">Write the code and test cases to see result.</p>';
    });
    // start the timer
    let hoursLabel = document.getElementById("hours");
    let minutesLabel = document.getElementById("minutes");
    let secondsLabel = document.getElementById("seconds");
    let totalSeconds = 0;
    setInterval(
      setTime(totalSeconds, hoursLabel, minutesLabel, secondsLabel),
      1000
    );
  });

  // 接收 codeResult 並顯示（每次都蓋掉上次的）
  socket.on("codeResult", resultObj => {
    // 顯示自己的結果在自己的 terminal
    if (resultObj.user === userID) {
      document.getElementById("runCodeOutput").innerHTML = "";
      document.getElementById("runCodeOutput").innerHTML = resultObj.output;
      return;
    }
    // 顯示別人的結果在自己的 terminal
    document.getElementById("opponentRunCodeOutput").innerHTML =
      resultObj.output;
  });

  socket.once("waitForMatchEnd", submitMessage => {
    console.log("waitForMatchEnd");
    if (submitMessage.user === userID) {
      text = `Awesome! Let's wait for your opponent to submit.`;
      showAlert(text, () => {
        // ++++++++++++ 等待的時候可以幹啥？聊天！
      });
      return;
    }
    document.getElementById(
      "opponentRunCodeOutput"
    ).innerHTML = `<p id="terminalMessage">${submitMessage.message}</p>`;
  });

  socket.once("endMatch", matchKey => {
    showAlert("The match has ended! Let check out the result.", () => {
      // redirect to match_result page with match_key param
      window.location = `/match_result/${matchKey}`;
      // ++++++++++++ stop timer
    });
  });
};


function setTime(totalSeconds, hoursLabel, minutesLabel, secondsLabel) {
  return () => {
    totalSeconds = totalSeconds + 1;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt((totalSeconds % 3600) / 60));
    hoursLabel.innerHTML = pad(parseInt(totalSeconds / 3600));
  };
}

function pad(val) {
  let valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function runCode() {
  console.log('userID in runCode',userID);
  if (!document.getElementById("questionDescription")) {
    showAlert('You can only run your code after the match starts.')
    return;
  }
  // 隱藏 test case
  document.getElementById("testCaseArea").style.display = "none";
  document.getElementById("testcaseBtn").style.background = "#444444";
  // 顯示 run code
  document.getElementById("runCodeOutput").style.display = "flex";
  document.getElementById("runcodeBtn").style.background = "#555555";

  // send code & test to server
  let codeareaValue = codemirrorEditor.getValue();
  let sampleTestCase = document.getElementById("sampleTestCase").textContent;
  let testcaseValue = document.getElementById("testcase").value;
  testcaseValue = sampleTestCase + "\n" + testcaseValue;

  let payload = {
    user: userID,
    code: codeareaValue,
    test: testcaseValue,
    difficulty,
    questionConst,
    sampleCaseExpected
  };
  socket.emit("codeObject", payload);
}

function submitCode() {
  if (!document.getElementById("questionDescription")) {
    showAlert('You can only submit after the match starts.')
    return;
  }
  let text = "Are you sure? You can only submit once!";
  showAlertWithButtons(text, () => {
    const buttons = document.getElementsByClassName("modalButtons")[0];
    buttons.style.display = "none";
    showAlert("Hold on! Our server is evaluating your code now...");
    // send code to server (get test cases in server)
    let codeareaValue = codemirrorEditor.getValue();
    let payload = {
      user: userID,
      code: codeareaValue,
      difficulty
    };
    console.log('submit payload', payload)
    socket.emit("submit", payload);
  });
}

function showTestCase() {
  if (!document.getElementById("questionDescription")) {
    return;
  }
  // 顯示 test case
  document.getElementById("testCaseArea").style.display = "flex";
  document.getElementById("testcaseBtn").style.background = "#555555";
  // 隱藏 run code
  document.getElementById("runCodeOutput").style.display = "none";
  document.getElementById("runcodeBtn").style.background = "#444444";
}

function exitMatch() {
  let text = `Are you sure you want to exit the match? You can join this match again if it's within match time.`;
  showAlertWithButtons(text, () => {
    window.location.pathname = "/";
    socket.emit("exit", userID);
  });
}

function showHelp() {
  // show help message
}
