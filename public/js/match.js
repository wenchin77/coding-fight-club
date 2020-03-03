// verify signin first
if (!localStorage.getItem("token") || !localStorage.getItem("id")) {
  const url = window.location.pathname;
  localStorage.setItem('invited_url', url);
  window.location.pathname = "signin";
}

if (localStorage.getItem("token") && localStorage.getItem('invited_url')){
  // remove item to prevent wrong redirecting later
  localStorage.removeItem('invited_url');
  console.log('invited_url removed...')
}

let token = localStorage.getItem("token");
let userID = parseInt(localStorage.getItem('id'));
let opponent;
let sampleCaseExpected;
let questionConst;
let difficulty;

// only init socket in match when there's a token and userid
// this is to prevent undefined usernames from being sent to server & showing here
if (localStorage.getItem('token') && localStorage.getItem('id')){
  console.log('socket in match init...')
  socketInMatchInit();
}

function socketInMatchInit() {
  // socket already initialized at socket.js
  // so we're not using socket.on('connect') here
  socket.emit("joinMatch", token);

  // too many people in a match: reject and redirect
  socket.on("rejectUser", msg => {
    showAlert(msg, () => {
      window.location = "/match_setup";
    });
  });

  // submitted already
  socket.on("alreadySubmitted", () => {
    showAlert(
      "You already submitted your code or exited this match. Let's wait a bit for your opponent to submit!"
    );
  });

  socket.once("waitForOpponent", msg => {
    showAlertNoButtons(msg);
    document.getElementById("runCodeOutput").innerHTML =
    '<p id="terminalMessage">Hold on. You will be able to read the question and code right after your opponent joins.</p>';
  });

  socket.on("joinLeaveMessage", msgObject => {
    // opponent joins / leaves
    if (msgObject.user !== userID) {
      document.getElementById("opponentRunCodeOutput").innerHTML = `<p id="terminalMessage">${msgObject.message}</p>`;
    }
  });

  socket.once("startMatch", startInfo => {
    console.log(startInfo);
    // get start time from db & start timer
    let secondsLeft = parseInt(startInfo.startTime / 1000 + 60 * 60 - Date.now() / 1000);
    console.log('secondsLeft',secondsLeft)
    if (secondsLeft <= 0) {
      showAlert('The match has ended!', () => {
        window.location.pathname = '/dashboard'
      })
      return;
    };
    setTimer(startInfo.startTime);

    // show opponent name
    console.log('users.user1.user',startInfo.user1.user);
    console.log('userID', userID);
    opponent = (startInfo.user1.user === userID) ? startInfo.user2.username : startInfo.user1.username;
    console.log('opponent',opponent);
    showQuestion(startInfo.question);

    // show start match message
    showAlert(`The match against ${opponent} is on!`, () => {
      document.getElementById("opponent").innerHTML = `Opponent: ${opponent}`;
      document.getElementById("runCodeOutput").innerHTML =
        '<p id="terminalMessage">Write the code in JavaScript and try out different test cases to see the result.</p>';
    });
    
  });

  // 接收 codeResult 並顯示（每次都蓋掉上次的）
  socket.on("codeResult", resultObj => {
    // show error message in red
    let firstLine = resultObj.output.split('\n')[0];
    let contentAfterFirstLine;
    if (resultObj.output.split('\n')[1]) {
      contentAfterFirstLine = resultObj.output.replace(firstLine + '\n', '');
    } else {
      contentAfterFirstLine = ''
    }
    // 顯示自己的結果在自己的 terminal
    if (resultObj.user === userID) {
      if(resultObj.output.includes('PASSED')) {
        document.getElementById("runCodeOutput").innerHTML = `<div style='color: green'>${firstLine}</div><div>${contentAfterFirstLine}</div>`;
      } else {
        document.getElementById("runCodeOutput").innerHTML = `<div style='color: red'>${firstLine}</div><div>${contentAfterFirstLine}</div>`;
      }
      return;
    };
    // 顯示別人的結果在自己的 terminal
    if(resultObj.output.includes('PASSED')) {
      document.getElementById("opponentRunCodeOutput").innerHTML = `<div style='color: green'>${firstLine}</div><div>${contentAfterFirstLine}</div>`;
    } else {
      document.getElementById("opponentRunCodeOutput").innerHTML = `<div style='color: red'>${firstLine}</div><div>${contentAfterFirstLine}</div>`;
    }
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

  socket.on('exitMultipleTimes', () => {
    window.location = `/`;
  })

  socket.on("endMatch", matchKey => {
    showAlert("The match has ended! Let check out the result.", () => {
      // redirect to match_result page with match_key param
      window.location = `/match_result/${matchKey}`;
    });
  });
};

function showQuestion(questionObject) {
  document.getElementById("matchQuestion").innerHTML = questionObject.question;
  document.getElementById("question").innerHTML = `<div id="questionDescription">${questionObject.description}</div>`;
  document.getElementById("sampleTestCase").innerHTML = questionObject.sampleCase;
  codemirrorEditor.setValue(questionObject.code);
  sampleCaseExpected = questionObject.sampleExpected;
  questionConst = questionObject.const;
  difficulty = questionObject.difficulty;
}

let timer;
function setTimer(startTime) {
  // start the timer
  let hoursLabel = document.getElementById("hours");
  let minutesLabel = document.getElementById("minutes");
  let secondsLabel = document.getElementById("seconds");
  let totalSeconds = 60 * 60; // +++++++++ 1h max
  timer = setInterval(() => {
    let secondsLeft = parseInt(startTime / 1000 + totalSeconds - Date.now() / 1000);
    if (secondsLeft === 0) {
      clearInterval(timer);
      console.log('match timed out, emitting exit...');
      showAlert('Times up!', () => {
        socket.emit("exit", token);
      })
      return;
    }
    showCountdown(secondsLeft, hoursLabel, minutesLabel, secondsLabel);
  }, 1000
  );
}

function stopTimer() {
  clearInterval(timer);
}

function showCountdown(secondsLeft, hoursLabel, minutesLabel, secondsLabel) {
  secondsLeft = secondsLeft - 1;
  secondsLabel.innerHTML = pad(secondsLeft % 60);
  minutesLabel.innerHTML = pad(parseInt((secondsLeft % 3600) / 60));
  hoursLabel.innerHTML = pad(parseInt(secondsLeft / 3600));
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
  if (!document.getElementById("questionDescription")) {
    showAlert('You can only run your code after the match starts.')
    return;
  }
  // 隱藏 test case
  document.getElementById("testCaseArea").style.display = "none";
  document.getElementById("testcaseBtn").style.background = "#444444";
  // 顯示 run code
  document.getElementById("runCodeOutput").style.display = "block";
  document.getElementById("runCodeOutput").innerHTML = "<div style='color: grey'>Running your code...</div>";
  document.getElementById("runcodeBtn").style.background = "#555555";

  // send code & test to server
  let codeareaValue = codemirrorEditor.getValue();
  let sampleTestCase = document.getElementById("sampleTestCase").textContent;
  let testcaseValue = document.getElementById("testcase").value;
  testcaseValue = sampleTestCase + "\n" + testcaseValue;

  let payload = {
    token,
    code: codeareaValue,
    test: testcaseValue,
    difficulty,
    questionConst,
    sampleCaseExpected
  };
  socket.emit("runCode", payload);
}

function submitCode() {
  if (!document.getElementById("questionDescription")) {
    showAlert('You can only submit after the match starts.')
    return;
  }
  let text = "Are you sure? You can only submit once!";
  showAlertWithButtons(text, () => {
    // stop timer
    stopTimer();
    showAlertNoButtons("Hold on! Our server is evaluating your code now...");
    // send code to server (get test cases in server)
    let codeareaValue = codemirrorEditor.getValue();
    let payload = {
      user: userID,
      token,
      code: codeareaValue,
      difficulty
    };
    console.log('submit payload', payload)
    socket.emit("submit", payload);
    localStorage.removeItem('invited_url');
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
  let text = `Are you sure you want to exit the match? You won't be able to submit in this match or get any points.`;
  showAlertWithButtons(text, () => {
    // stop timer
    stopTimer();
    window.location.pathname = "/";
    socket.emit("exit", token);
  });
}

function showHelp() {
  showAlert(`<p>Click on 'Test Case' to add or update test cases. Click on 'Run Code' to try out your current code with them whenever you want.</p>
  <p>When you are ready to submit your code, click on 'Submit'. You can only submit once in a match. If you exit, you won't be able to get points or submit again.</p>
  <p>Currently we only support JavaScript as the programming language.</p>`)
}
