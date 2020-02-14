const fs = require("fs");
const matchController = require('./controllers/matchController');
const questionController = require('./controllers/questionController');

// child process setup for code execution
const { spawn } = require("child_process");

// socket.io setup for live terminal result
const socketio = require("socket.io");
const socket = {};

socket.init = server => {
  const io = socketio.listen(server);
  const matchList = {}; // to save match key & user mapping info
  const socketidMapping = {}; // to save socketid & user mapping info
  const winnerCheck = {}; // on submit: to compare exec time and assign performance points

  io.on("connection", socket => {
    console.log("Socket: a user connected!");

    let url = socket.request.headers.referer;
    let matchKey = getMatchKey(url);
    
    socket.on("join", async (userID) => {
      
      let user = userID;

      // Add a room if it doesn't exist
      if (!matchList[matchKey]) {
        matchList[matchKey] = [];
      };

      // Reject a user if there are already 2 people in the room
      if (matchList[matchKey].length >= 2) {
        socket.emit('rejectUser', 'Oops, there are already two people in this match!');
        return;
      }

      // Add user to the room
      matchList[matchKey].push(user);

      // Add user to socketidMapping (socketid: user)
      if (!socketidMapping[socket.id]) {
        socketidMapping[socket.id] = user;
      };

      // Join room
      socket.join(matchKey, () => {
        console.log(`Socket: ${user} joined ${matchKey} (socket.id = ${socket.id})`);
        console.log('matchList: ', matchList);
        console.log('socketidMapping', socketidMapping)
        let joinMessage = {
          user: user,
          message: `${user} joined the match.`
        }
        io.to(matchKey).emit('joinLeaveMessage', joinMessage);
      });

      // Wait for opponent if there's only 1 person in the room
      if (matchList[matchKey].length === 1) {
        socket.emit('waitForOpponent');
        return;
      };
      
      // when there are 2 people in the room
      let questionObject = await getQuestionDetail(matchKey, false);
      io.to(matchKey).emit("questionData", questionObject);

      // send user info to display
      let users = {
        user1: matchList[matchKey][0],
        user2: matchList[matchKey][1]
      };
      io.to(matchKey).emit('startMatch', users);

      // update match start time & user2 (when user2 joins)
      let matchID = await matchController.updateMatch(matchKey, user);

      // insert into match_detail (make sure there are no duplicated rows)
      await matchController.insertMatchDetail(matchID, matchList[matchKey][0]);
      await matchController.insertMatchDetail(matchID, matchList[matchKey][1]);
      
    });

    socket.on("codeObject", async data => {
      let code = data.code;
      let user = data.user;
      let testAll = data.test;
      let test = testAll.split("\n");
      let difficulty = data.difficulty;
      let questionConst = data.questionConst;
      let sampleCaseExpected = data.sampleCaseExpected;

      // put together the code for running
      let finalCode = putTogetherCodeOnRun(code, questionConst, sampleCaseExpected, test);

      // 按不同 user 存到 ./sessions js files
      setUserCodeFile(matchKey, user, finalCode);

      let codeResult = {};
      // Run code in child process
      try {
        let childResult = await runCodeInChildProcess(matchKey, user, difficulty, 10);
        
        // give sample test case result
        let sampleSplited = childResult.split('\n');
        let sampleOutput = sampleSplited[1].split(': ')[1];
        let sampleExpected = sampleSplited[2].split(': ')[1];

        // add sample test result to childResult
        if (sampleOutput == sampleExpected) {
          childResult = 'SAMPLE TEST PASSED\n' + childResult;
        } else {
          childResult = 'SAMPLE TEST FAILED\n' + childResult;
        }

        // 回丟一個物件帶有 user 資料以區分是自己還是對手的結果
        codeResult = {
          user: user,
          output: JSON.stringify(childResult)
        };
      } catch (e) {
        // let errorMessage = "Error: Please put in valid code and test data"
        codeResult = {
          user: user,
          output: JSON.stringify(e)
        };
      }
      // send an event to everyone in the room including the sender
      io.to(matchKey).emit("codeResult", codeResult);
    });

    socket.on('submit', async (data) => {
      let user = data.user;
      let code = data.code;

      let questionObject = await getQuestionDetail(matchKey, true);
      let questionConst = questionObject.const;
      let smallTestCases = questionObject.smallSampleCases;
      let largeTestCases = questionObject.largeSampleCases;
      let difficulty = questionObject.difficulty;

      // put together the code & run one test case at a time
      let smallTestCasesNumber = smallTestCases.length;
      let smallPassedCasesNumber = 0;
      let testCasesResult = 'SMALL TEST CASES RESULT\n';
      for (i=0;i<smallTestCases.length;i++) {
        let testCaseFinalCode = putTogetherCodeOnSubmit(code, questionConst, smallTestCases[i]);

        // 按不同 user 存到 ./sessions js files
        setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await runCodeInChildProcess(matchKey, user, difficulty, 20);
          
          // give sample test case result
          let childResultSplited = childResult.split('\n');
          let testOutput = childResultSplited[0];
          let testExpectedOutput = smallTestCases[i].test_result;

          // add sample test result to childResult
          if (testOutput == testExpectedOutput) {
            console.log(`test case [${i}] passed`)
            smallPassedCasesNumber += 1;
            testCasesResult += `TEST PASSED\nValue equals ${testExpectedOutput}\n\n`;
          } else {
            console.log(`test case [${i}] failed`)
            testCasesResult += `TEST FAILED\nExpected: ${testExpectedOutput}, instead got: ${testOutput}\n\n`;
          }
        } catch (e) {
          console.log(e)
        };
      };

      // 類似的扣：之後跟上面的整理 +++++++++++++++
      let largeTestCasesNumber = largeTestCases.length;
      let largePassedCasesNumber = 0;
      let largeTestExecTimeSum = 0;
      testCasesResult += 'LARGE TEST CASES RESULT\n';
      let largeExecTimeObj = []; // 這個跟小測資不同！
      for (i=0;i<largeTestCases.length;i++) {
        let testCaseFinalCode = putTogetherCodeOnSubmit(code, questionConst, largeTestCases[i]);
        // 按不同 user 存到 ./sessions js files
        setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await runCodeInChildProcess(matchKey, user, difficulty, 80);
          
          // give sample test case result
          let childResultSplited = childResult.split('\n');
          let testOutput = childResultSplited[0];
          let testExecTime = childResultSplited[1].split('Time: ')[1].split('ms')[0];
          let testExpectedOutput = largeTestCases[i].test_result;

          // add sample test result to childResult
          if (testOutput == testExpectedOutput) {
            console.log(`test case [${i}] passed`)
            largePassedCasesNumber += 1;
            largeTestExecTimeSum += parseFloat(testExecTime);
            largeExecTimeObj.push(testExecTime);
            testCasesResult += `TEST PASSED\nValue equals ${testExpectedOutput}\n\n`;
          } else {
            console.log(`test case [${i}] failed`);
            largeExecTimeObj.push('failed');
            testCasesResult += `TEST FAILED\nExpected: ${testExpectedOutput}, instead got: ${testOutput}\n\n`;
          }
        } catch (e) {
          console.log(e)
        };
      };
      
      // calculate passed test cases
      let smallCorrectness = `${smallPassedCasesNumber}/${smallTestCasesNumber}`
      let largeCorrectness = `${largePassedCasesNumber}/${largeTestCasesNumber}`
      let correctness = 100 * parseFloat((smallPassedCasesNumber + largePassedCasesNumber)/(smallTestCasesNumber + largeTestCasesNumber))


      // calculate exec time (counting with passed tests only)
      let largeExecTime;
      if (largePassedCasesNumber === 0) {
        largeExecTime = null;
      } else {
        largeExecTime = largeTestExecTimeSum/largePassedCasesNumber;
      }

      // calculate answer time
      let startTime = await matchController.getMatchStartTime(matchKey);
      let answerTime = (Date.now() - startTime)/1000; // in seconds



      let matchID = await matchController.getMatchId(matchKey);
      // rate correctness, performance
      let calculated = await calculatePoints(matchKey, correctness, largeExecTimeObj);
      let performance = calculated.perfPoints;
      let points = calculated.points;
      let largePassed = calculated.largePassed;
      // 紀錄 code 跟項目評分在 match_detail
      let updateMatchDetailResult = await matchController.updateMatchDetail(matchID, user, code, smallCorrectness, largeCorrectness, correctness, largePassed, largeExecTime, performance, answerTime, points);
      
      // +++++++ 更新兩人的 user table: points (and level table if needed)


      // update winnerCheck {} for performance points calculation (temp)
      if (!winnerCheck[matchKey]) {
        winnerCheck[matchKey] = [];
      };
      let result = {
        user,
        smallCorrectness,
        largePassed,
        correctness,
        largeCorrectness,
        largeExecTime,
        performance,
        answerTime,
        points
      };
      winnerCheck[matchKey].push(result);
      console.log('winnerCheck', winnerCheck); 

      // fs 刪掉 ./sessions js files
      deleteFile(matchKey, user);

      // check 自己是第幾個 insert match_detail 的人
      let submitNumber = winnerCheck[matchKey].length;

      if (submitNumber < 2) {
        // 如果自己是第一個：給 testCasesResult + 等待訊息
        let submitMessage = {
          user,
          message: `${user} submitted the code! We're waiting for your submission.`,
          testCasesResult
        }
        io.to(matchKey).emit('waitForMatchEnd', submitMessage);
        return;
      }
      
      // 如果自己是第二個：給 testCasesResult
      socket.emit('testCasesResult', testCasesResult);
      
      // compare correctness, execTime, answerTime to get winner
      let winner = await getWinner(winnerCheck, matchKey);

      // update match_table: winner
      await matchController.updateMatchWinner(matchKey, winner); 

      // for frontend to redirect
      io.to(matchKey).emit('endMatch', matchKey);
      
    })

    socket.on(('disconnect' || 'exit'), () => {
      console.log("Socket: a user disconnected");

      // 用 socketidMapping (socketid: user) 找出退出的 user
      let socketid = socket.id;
      let user = socketidMapping[socketid];

      let leaveMessage = {
        user: user,
        message: `${user} left the match. You can still get points if you finish the match.`
      }
      io.to(matchKey).emit("joinLeaveMessage", leaveMessage);

      delete socketidMapping[socketid];

      if (matchList[matchKey]) {
        let index = matchList[matchKey].indexOf(user);
        if (index !== -1) {
          matchList[matchKey].splice(index, 1);
          if (matchList[matchKey].length === 0) {
            delete matchList[matchKey];
          }
        }
        socket.leave(matchKey); // leave socket room
        console.log(`Socket: ${user} left ${matchKey} (socket.id ${socket.id})`);
      }

    });
  });
};


const setUserCodeFile = (matchKey, user, code) => {
  let answerFile = fs.openSync(`./sessions/${matchKey}_${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
  fs.closeSync(answerFile);
};

const deleteFile = (matchKey, user) => {
  let path = `./sessions/${matchKey}_${user}.js`;
  fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`${matchKey}_${user}.js file removed`)
  })
}

const putTogetherCodeOnRun = (code, codeConst, expected, test) => {
  let sampleTestCaseExpected = JSON.stringify(expected);
  // exec time calculation
  let finalCode = `console.time('Time');\n${code}\n`;
  // sample test case
  let consoleLogCode = `console.log('Sample test case: '+'${test[0]}');\nlet result_sample = JSON.stringify(${codeConst}(${test[0]}));\nconsole.log('Sample output: '+result_sample);\nconsole.log('Sample output expected: '+${sampleTestCaseExpected})`;
  // user's test case
  for (i=1; i<5; i++) {
    if (test[i] && test[i]!==''){
      consoleLogCode += `\nconsole.log('')`
      consoleLogCode += `\nconsole.log('Your test case: '+'${test[i]}');`
      consoleLogCode += `\nlet result_${i} = JSON.stringify(${codeConst}(${test[i]}));`;
      consoleLogCode += `\nconsole.log('Output: '+result_${i});`
    }
  };
  // format
  finalCode += (consoleLogCode + `\nconsole.log('')`);
  finalCode += `\nconsole.timeEnd('Time');`;
  return finalCode;
};

const putTogetherCodeOnSubmit = (code, questionConst, sampleCase) => {
  let testCase = fs.readFileSync(sampleCase.test_case_path, {encoding: 'utf-8'});
  // exec time calculation
  let finalCode = `console.time('Time');\n${code}\nconsole.log(JSON.stringify(${questionConst}(${testCase})))`;
  // format
  finalCode += `\nconsole.timeEnd('Time')`; // console.log(process.memoryUsage());
  return finalCode;
};


const getQuestionDetail = async (matchKey, submitBoolean) => {
  // get questionID with matchKey
  let questionID = await matchController.getMatchQuestion(matchKey);
  // get question details with questionID
  let getQuestionResult = await questionController.selectQuestion(questionID);
  // get sample test case with questionID
  let smallSampleCases = await questionController.selectSampleTestCases(questionID, 0);
  let largeSampleCases = await questionController.selectSampleTestCases(questionID, 1);

  let questionObject = {
    questionID: questionID,
    question: getQuestionResult.question_name,
    description: getQuestionResult.question_text,
    code: getQuestionResult.question_code,
    difficulty: getQuestionResult.difficulty,
    category: getQuestionResult.category,
    const: getQuestionResult.question_const,
  };

  // senario: both users join (send sampleCases[0])
  if (!submitBoolean) {
    let sampleCase = smallSampleCases[0];
    questionObject.sampleCase = fs.readFileSync(sampleCase.test_case_path, {encoding: 'utf-8'});
    questionObject.sampleExpected = sampleCase.test_result;
    return questionObject;
  };

  // senario: a user submits (send sampleCases)
  questionObject.smallSampleCases = smallSampleCases;
  questionObject.largeSampleCases = largeSampleCases;
  return questionObject;
}


const runCodeInChildProcess = (matchKey, user, difficulty, memoryLimit) => {
  return new Promise((resolve, reject) => {
    let ls = spawn('node', [`--max-old-space-size=${memoryLimit}`, '--experimental-report', '--report-filename=./report.json',`./sessions/${matchKey}_${user}.js`]);
    let result = '';
    
    // timeout error setting
    let timeoutMs = getTimeoutMs(difficulty);
    let setTimeoutId = setTimeout(() => {
      console.log('timeout: killing ls...');
      ls.kill();
      reject('EXECUTION TIMED OUT');
    }, timeoutMs);
    
    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      // output 性質是 ArrayBuffer 所以要先處理
      // 等每個 output 出來組在一起
      result += arrayBufferToStr(data); // check 結果型態 -> arrayBufferToStr 可以不用？？
    });
    
    ls.stderr.on('data', (data) => {
      result += arrayBufferToStr(data); // check 結果型態 -> arrayBufferToStr 可以不用？？
      console.error(`stderr: ${data}`);
    });

    ls.on('error', reject)
      .on('close', code => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
      console.log(`exited child_process at ${matchKey}_${user}.js with code ${code}`);
      clearTimeout(setTimeoutId);
      console.log('cleared timeout');
    });


    
  });
}

const getTimeoutMs = difficulty => {
  if(difficulty === 'easy') {
    return 12000;
  } else if (difficulty === 'medium') {
    return 15000;
  }
  return 20000;
}


const getMatchKey = url => {
  let urlSplitedBySlash = url.split("/");
  let key = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  return key;
}

const calculatePoints = async (matchKey, totalCorrectness, largeExecTimeObj) => {
  // rate performance
  let perfPoints = 0;
  let largePassedNo = 0;

  // get questionID with matchKey
  let questionID = await matchController.getMatchQuestion(matchKey);
  // get threshold_ms from db test table
  let largeThreshold = await questionController.selectThresholdMs(questionID);

  for (i=0; i<largeThreshold.length; i++) {
    if (largeExecTimeObj[i] <= largeThreshold[i].threshold_ms) {
      perfPoints += (100/(largeThreshold.length));
      largePassedNo += 1;
    }
  }

  let largePassed = `${largePassedNo}/${largeExecTimeObj.length}`;

  let points = (totalCorrectness + perfPoints) / 2
  
  let calculated = {
    perfPoints,
    points,
    largePassed
  }
  return calculated;
}

const getWinner = async (winnerCheck, matchKey) => {
  let winner;
  let user_0 = winnerCheck[matchKey][0].user;
  let user_1 = winnerCheck[matchKey][1].user;

  // points
  let points_0 = winnerCheck[matchKey][0].points;
  let points_1 = winnerCheck[matchKey][1].points;

  // answer time
  let answerTime_0 = winnerCheck[matchKey][0].answerTime;
  let answerTime_1 = winnerCheck[matchKey][1].answerTime;

  if (points_0 > points_1) {
    winner = user_0;
  } else if (points_0 < points_1) {
    winner = user_1;
  } else { // same points
    if (answerTime_0 < answerTime_1) {
      winner = user_0;
    } else if (answerTime_0 > answerTime_1) {
      winner = user_1;
    } else {
      winner = null;
    }
  }
  return winner;
}

const arrayBufferToStr = buf => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

module.exports = socket;
