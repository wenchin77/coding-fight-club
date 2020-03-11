const fs = require("fs");
const { spawn } = require("child_process");
const AWS = require("aws-sdk");
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const bucket = process.env.AWS_S3_BUCKET;

const getMatchKey = url => {
  let urlSplitedBySlash = url.split("/");
  let key = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  return key;
};

let getStranger = (inviterId, availableUsers) => {
  if (availableUsers.size <= 1) {
    console.log("only 1 user online now...");
    return false;
  }

  console.log("Array.from(availableUsers)", Array.from(availableUsers));
  let index = (availableUsers.size.length * Math.random()) << 0;

  let strangerId = Array.from(availableUsers)[index];

  if (strangerId === inviterId) {
    // if token belongs to me, find the next person
    let newIndex = (index + 1) % availableUsers.size;
    let newStrangerId = Array.from(availableUsers)[newIndex];
    return newStrangerId;
  } else {
    return strangerId;
  }
};

const setUserCodeFile = (matchKey, user, code) => {
  let answerFile = fs.openSync(`./sessions/${matchKey}_${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
  fs.closeSync(answerFile);
};

const deleteFile = (matchKey, user) => {
  let path = `./sessions/${matchKey}_${user}.js`;
  if (fs.existsSync(path)) {
    fs.unlink(path, err => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`${matchKey}_${user}.js file removed`);
    });
  }
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

async function putTogetherCodeOnSubmit(code, questionConst, caseFile) {
  console.log(caseFile)
  try{
    let testCase = await getS3File(caseFile.test_case_path);
    let finalCode = `console.time('Time');\n${code}\nconsole.log(JSON.stringify(${questionConst}(${testCase})))`;
    finalCode += `\nconsole.timeEnd('Time')`;
    return finalCode;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

function getS3File(filename) {
  return new Promise((resolve, reject) => {
    const params = { Bucket: bucket, Key: filename };
    s3.getObject(params, (err, data) => {
      if (err) reject(err);
      if (data) {
        let result = Buffer.from(data.Body).toString("utf8");
        resolve(result);
      }
    });
  });
};

const runCodeInChildProcess = (matchKey, user, difficulty, memoryLimit) => {
  return new Promise((resolve, reject) => {
    // limit max memory to prevent out of memory situations
    let childProcess = spawn("node", [
      `--max-old-space-size=${memoryLimit}`,
      `./sessions/${matchKey}_${user}.js`
    ]);
    let result = "";

    // timeout error setting
    let timeoutMs = getTimeoutMs(difficulty);
    let setTimeoutId = setTimeout(() => {
      childProcess.kill();
      console.log("timeout: killing child process...");
      reject("EXECUTION TIMED OUT");
    }, timeoutMs);

    childProcess.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      // output 性質是 ArrayBuffer 所以要先處理
      result += arrayBufferToStr(data);
    });

    childProcess.stderr.on("data", data => {
      let dataStr = arrayBufferToStr(data);
      if (data.includes("out of memory")) {
        childProcess.kill();
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
      reject("Unknown error");
      console.error(`stderr: ${data}`);
    });

    childProcess.on("error", reject).on("close", code => {
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

const getWinner = (winnerCheck, matchKey) => {
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

const deleteTimedOutUsers = (onlineUsers, availableUsers, inMatchUsers, tokenIdMapping) => {
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
  getStranger,
  setUserCodeFile,
  deleteFile,
  putTogetherCodeOnRun,
  putTogetherCodeOnSubmit,
  runCodeInChildProcess,
  deleteTimedOutUsers,
  addSampleTestResult,
  getWinner,
  checkSubmitTime
};
