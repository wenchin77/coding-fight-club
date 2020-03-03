const fs = require("fs");
const matchController = require("../controllers/matchController");
const questionController = require("../controllers/questionController");
const userController = require("../controllers/userController");

// child process setup for code execution
const { spawn } = require("child_process");

const getMatchKey = url => {
  let urlSplitedBySlash = url.split("/");
  let key = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  return key;
};

async function getUserInfo(token, onlineUsers, tokenIdMapping) {
  let user;
  let username;
  let userObj;
  try {
    if (!tokenIdMapping.has(token)) {
      console.log("Cannot find user at tokenIdMapping, selecting from db...");
      let result = await userController.selectUserInfoByToken(token);
      user = result[0].id;
      username = result[0].user_name;
      userObj = {
        username,
        time: Date.now(),
        inviting: 0,
        invitation_accepted: 0,
        invited: []
      };
      console.log(user, username);
      console.log("inserting onlineUsers...");
      onlineUsers.set(user, userObj);
      console.log("inserting tokenIdMapping...");
      tokenIdMapping.set(token, user);
      console.log("onlineUsers", onlineUsers);
      console.log("onlineUsers size", onlineUsers.size);
      return { user, username };
    }
    console.log("Found user at tokenIdMapping");
    user = tokenIdMapping.get(token);
    username = onlineUsers.get(user).username;
    return { user, username };
  } catch (err) {
    console.log(err);
  }
}

let getStranger = (inviterId, availableUsers) => {
  if (availableUsers.size <= 1) {
    console.log("only 1 user online now...");
    return false;
  }

  console.log("Array.from(availableUsers)", Array.from(availableUsers));
  let index = (availableUsers.size.length * Math.random()) << 0;
  // let index = availableUsers.size * Math.random()

  let strangerId = Array.from(availableUsers)[index];
  console.log("index", index);
  console.log("strangerId", strangerId);
  console.log("inviterId (my id)", inviterId);

  if (strangerId === inviterId) {
    console.log("stranger === me, find the next person");
    // if token belongs to me, find the next person
    let newIndex = (index + 1) % availableUsers.size;
    console.log("newIndex", newIndex);
    let newStrangerId = Array.from(availableUsers)[newIndex];
    console.log("newStrangerId", newStrangerId);
    return newStrangerId;
  } else {
    return strangerId;
  }
};

const getMatchStatus = async matchKey => {
  try {
    let result = await matchController.getMatchStatus(matchKey);
    if (result.length > 0) {
      return result[0].match_status;
    }
    return 1;
  } catch (err) {
    console.log(err);
    return 1;
  }
};

const setUserCodeFile = (matchKey, user, code) => {
  let answerFile = fs.openSync(`./sessions/${matchKey}_${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
  fs.closeSync(answerFile);
};

const deleteFile = (matchKey, user) => {
  let path = `./sessions/${matchKey}_${user}.js`;
  fs.unlink(path, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`${matchKey}_${user}.js file removed`);
  });
};

const putTogetherCodeOnRun = (code, codeConst, expected, test) => {
  let sampleTestCaseExpected = JSON.stringify(expected);
  let finalCode = `console.time('Time');\n${code}\n`;
  let consoleLogCode = `console.log('Sample test case: '+'${test[0]}');\nlet result_sample = JSON.stringify(${codeConst}(${test[0]}));\nconsole.log('Sample output: '+result_sample);\nconsole.log('Sample output expected: '+${sampleTestCaseExpected})`;
  for (i = 1; i < 5; i++) {
    if (test[i] && test[i] !== "") {
      consoleLogCode += `\nconsole.log('')`;
      consoleLogCode += `\nconsole.log('Your test case: '+'${test[i]}');`;
      consoleLogCode += `\nlet result_${i} = JSON.stringify(${codeConst}(${test[i]}));`;
      consoleLogCode += `\nconsole.log('Output: '+result_${i});`;
    }
  }
  finalCode += consoleLogCode + `\nconsole.log('')`;
  finalCode += `\nconsole.timeEnd('Time');`;
  return finalCode;
};

const putTogetherCodeOnSubmit = (code, questionConst, sampleCase) => {
  let testCase = fs.readFileSync(sampleCase.test_case_path, {
    encoding: "utf-8"
  });
  let finalCode = `console.time('Time');\n${code}\nconsole.log(JSON.stringify(${questionConst}(${testCase})))`;
  finalCode += `\nconsole.timeEnd('Time')`;
  return finalCode;
};

const getQuestionDetail = async (matchKey, submitBoolean) => {
  // get questionID with matchKey
  let questionID = await matchController.getMatchQuestion(matchKey);
  // get question details with questionID
  let getQuestionResult = await questionController.selectQuestion(questionID);
  // get sample test case with questionID
  let smallSampleCases = await questionController.selectSampleTestCases(
    questionID,
    0
  );
  let largeSampleCases = await questionController.selectSampleTestCases(
    questionID,
    1
  );

  let questionObject = {
    questionID: questionID,
    question: getQuestionResult.question_name,
    description: getQuestionResult.question_text,
    code: getQuestionResult.question_code,
    difficulty: getQuestionResult.difficulty,
    category: getQuestionResult.category,
    const: getQuestionResult.question_const
  };

  // senario: both users join (send sampleCases[0])
  if (!submitBoolean) {
    let sampleCase = smallSampleCases[0];
    questionObject.sampleCase = fs.readFileSync(sampleCase.test_case_path, {
      encoding: "utf-8"
    });
    questionObject.sampleExpected = sampleCase.test_result;
    return questionObject;
  }

  // senario: a user submits (send sampleCases)
  questionObject.smallSampleCases = smallSampleCases;
  questionObject.largeSampleCases = largeSampleCases;
  return questionObject;
};

const runCodeInChildProcess = (matchKey, user, difficulty, memoryLimit) => {
  return new Promise((resolve, reject) => {
    // limit max memory to prevent out of memory situations
    let ls = spawn("node", [
      `--max-old-space-size=${memoryLimit}`,
      `./sessions/${matchKey}_${user}.js`
    ]);
    let result = "";

    // timeout error setting
    let timeoutMs = getTimeoutMs(difficulty);
    let setTimeoutId = setTimeout(() => {
      ls.kill();
      console.log("timeout: killing child process...");
      reject("EXECUTION TIMED OUT");
    }, timeoutMs);

    ls.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      // output 性質是 ArrayBuffer 所以要先處理
      result += arrayBufferToStr(data);
    });

    ls.stderr.on("data", data => {
      let dataStr = arrayBufferToStr(data);
      if (data.includes("out of memory")) {
        ls.kill();
        console.log("out of memory: killing child process...");
        reject("OUT OF MEMORY");
      }
      if (dataStr.includes("Error")) {
        errorMsg =
          dataStr
            .split("Error")[0]
            .split("\n")
            .pop(-1) +
          "Error" +
          dataStr.split("Error")[1].split("\n")[0];
        reject(errorMsg);
      }
      if (dataStr.includes("throw")) {
        errorMsg = dataStr.split("throw")[1];
        reject(`throw${errorMsg}`);
      }
      reject("Unknow error");
      console.error(`stderr: ${data}`);
    });

    ls.on("error", reject).on("close", code => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
      console.log(
        `exited child_process at ${matchKey}_${user}.js with code ${code}`
      );
      clearTimeout(setTimeoutId); // clear it or it'll keep timing
    });
  });
};

const addSampleTestResult = (childResult) => {
  let updatedChildResult;
  let sampleSplited = childResult.split("\n");
  let sampleOutput = sampleSplited[1].split(": ")[1];
  let sampleExpected = sampleSplited[2].split(": ")[1];
  if (sampleOutput == sampleExpected) {
    updatedChildResult = "SAMPLE TEST PASSED\n" + childResult;
  } else {
    updatedChildResult = "SAMPLE TEST FAILED\n" + childResult;
  }
  // 回丟一個物件帶有 user 資料以區分是自己還是對手的結果
  return updatedChildResult;
}

const getTimeoutMs = difficulty => {
  if (difficulty === "easy") {
    return 12000;
  } else if (difficulty === "medium") {
    return 15000;
  }
  return 20000;
};

const calculatePoints = async (
  matchKey,
  totalCorrectness,
  largeExecTimeArr
) => {
  let perfPoints = 0;
  let largePassedNo = 0;
  let questionID = await matchController.getMatchQuestion(matchKey);
  let largeThreshold = await questionController.selectThresholdMs(questionID);
  for (let i = 0; i < largeThreshold.length; i++) {
    // large test failed: -1 in largeExecTimeArr
    if (parseInt(largeExecTimeArr[i]) >=0 && (parseInt(largeExecTimeArr[i]) <= largeThreshold[i].threshold_ms)) {
      perfPoints += 100 / largeThreshold.length;
      largePassedNo += 1;
    };
  };
  let largePassed = `${largePassedNo}/${largeExecTimeArr.length}`;
  let points = (totalCorrectness + perfPoints) / 2;
  let calculated = {
    perfPoints,
    points,
    largePassed
  };
  return calculated;
};

const getWinner = async (winnerCheck, matchKey) => {
  let user_0 = winnerCheck.get(matchKey)[0].user;
  let user_1 = winnerCheck.get(matchKey)[1].user;
  let points_0 = winnerCheck.get(matchKey)[0].points;
  let points_1 = winnerCheck.get(matchKey)[1].points;
  let answerTime_0 = winnerCheck.get(matchKey)[0].answerTime;
  let answerTime_1 = winnerCheck.get(matchKey)[1].answerTime;

  if (points_0 === 0 && points_1 === 0) {
    return 'tie';
  };
  if (points_0 > points_1) {
    return user_0;
  };
  if (points_0 < points_1) {
    return user_1;
  };
  if (answerTime_0 < answerTime_1) {
    return user_0;
  };
  if (answerTime_0 > answerTime_1) {
    return user_1;
  };
  return 'tie';
};

const checkSubmitTime = (winnerCheck, matchKey, user) => {
  // Check if the user submitted before
  let submitTime = 0;
  if (winnerCheck.has(matchKey)) {
    for (let i = 0; i < winnerCheck.get(matchKey).length; i++) {
      if (winnerCheck.get(matchKey)[i].user === user) {
        submitTime += 1;
        console.log(
          "winnerCheck[matchKey][i].user --- ",
          winnerCheck.get(matchKey)[i].user
        );
      }
    }
  }
  console.log("submitTime ---", submitTime);
  return submitTime;
};

const updateWinnerCheck = (winnerCheck, matchKey, result) => {
  // update winnerCheck {} for performance points calculation
  if (!winnerCheck.has(matchKey)) {
    winnerCheck.set(matchKey, []);
  }
  winnerCheck.get(matchKey).push(result);
};

const deleteTimedOutMatches = async (matchList, matchKey) => {
  let startTime = matchList.get(matchKey).start_time;
  if (startTime > 0 && Date.now() - startTime > 1000 * 60 * 60) {
    console.log("match timeout, deleting match in matchList...", matchKey);
    matchList.delete(matchKey);
    console.log("updating match status to 1...");
    try {
      await matchController.updateMatchStatus(matchKey, 1);
    } catch (err) {
      console.log(err);
    }
    console.log("matchList size after checking", matchList.size);
  }
};

const deleteTimedOutUsers = async (onlineUsers, availableUsers, inMatchUsers, tokenIdMapping) => {
  for (let userid of onlineUsers.keys()) {
    let value = onlineUsers.get(userid);
    if ((Date.now() - value.time > 1000 * 60) && (!inMatchUsers.has(userid))) {
      console.log(
        "user timeout, deleting user in onlineUsers, availableUsers and tokenIdMapping...",
        userid
      );
      onlineUsers.delete(userid);
      console.log("onlineUsers size after checking", onlineUsers.size);
      availableUsers.delete(userid);
      console.log("availableUsers size after checking", availableUsers.size);
      for (let token of tokenIdMapping.keys()) {
        let value = tokenIdMapping.get(token);
        if (value === userid) {
          tokenIdMapping.delete(token);
        }
      }
      console.log("tokenIdMapping size after checking", tokenIdMapping.size);
    }
  }
};

const arrayBufferToStr = buf => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
};

module.exports = {
  getMatchKey,
  getUserInfo,
  getStranger,
  getMatchStatus,
  setUserCodeFile,
  deleteFile,
  putTogetherCodeOnRun,
  putTogetherCodeOnSubmit,
  getQuestionDetail,
  runCodeInChildProcess,
  calculatePoints,
  deleteTimedOutMatches,
  deleteTimedOutUsers,
  addSampleTestResult,
  getWinner,
  checkSubmitTime
};
