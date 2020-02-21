const fs = require("fs");
const matchController = require('./controllers/matchController');
const questionController = require('./controllers/questionController');
const userController = require('./controllers/userController');

// child process setup for code execution
const { spawn } = require("child_process");

// socket.io setup for live terminal result
const socketio = require("socket.io");
const socket = {};

socket.init = server => {
  console.log('socket server initialized...');

  const io = socketio.listen(server);
  const matchList = {}; // to save match key & user mapping info
  const socketidMapping = {}; // to save socketid & user mapping info
  const winnerCheck = {}; // on submit: to assign performance points
  const userIdNameMapping = {}; // to display username in frontend

  io.on("connection", socket => {
    console.log("io on connection: a user connected!");

    let url = socket.request.headers.referer;
    let matchKey = getMatchKey(url);
    console.log("io on connection: socketid: ", socket.id);
    
    socket.on("join", async (token) => {
      console.log('==================')
      let result = await userController.selectUserInfoByToken(token);
      let user = result[0].id;
      let username = result[0].user_name;
      console.log('socket on join, user: ', user)
      console.log('socket on join, username: ', username)
      console.log('==================')

      // Add user to socketidMapping (socketid: userid)
      if (!socketidMapping[socket.id]) {
        socketidMapping[socket.id] = user;
      };
      console.log('socket on join, socketidMapping: ', socketidMapping)

      // Add user to userIdNameMapping (userid: username)
      if (!userIdNameMapping[user]) {
        userIdNameMapping[user] = username;
      };
      console.log('socket on join, userIdNameMapping', userIdNameMapping)

      // Add a room if it doesn't exist
      if (!matchList[matchKey]) {
        matchList[matchKey] = [];
      };

      // +++++++++ watch mode?
      // Reject user if there are already 2 people in the room
      if (matchList[matchKey].length >= 2) {
        console.log('socket on join, matchList for too many people ===', matchList)
        socket.emit('rejectUser', 'Oops, there are already two people in this match!');
        return;
      }

      // Reject user if the him / her was already in the room
      if (matchList[matchKey].length === 1) {
        if (matchList[matchKey][0] === user) {
          socket.emit('rejectUser', 'You cannot start a match with yourself!');
          return;
        }
      }

      // Add user to the room list
      matchList[matchKey].push(user);
      console.log('socket on join, matchList', matchList);
      
      // Join room
      socket.join(matchKey, () => {
        console.log(`Socket: ${user} joined ${matchKey} (socket.id = ${socket.id})`);
        let joinMessage = {
          user: user,
          message: `${username} joined the match.`
        }
        io.to(matchKey).emit('joinLeaveMessage', joinMessage);
      });

      // Wait for opponent if there's only 1 person in the room
      if (matchList[matchKey].length === 1) {
        socket.emit('waitForOpponent', 'Hey there, we are waiting for your opponent to join!');
        return;
      };
      
      // when there are 2 people in the room
      let questionObject = await getQuestionDetail(matchKey, false);
      // io.to(matchKey).emit("questionData", questionObject);

      // send user info to display
      let userid1 = matchList[matchKey][0];
      let userid2 = matchList[matchKey][1];


      // get or insert match start time (only insert once at the start)
      let matchStartTime;
      if (await matchController.getMatchStartTime(matchKey)) {
        console.log('match start time already inserted...')
        matchStartTime = await matchController.getMatchStartTime(matchKey);
      } else {
        console.log('inserting match start time....')
        matchStartTime = Date.now();
        let matchID = await matchController.updateMatch(matchKey, matchStartTime);
        // insert into match_detail (make sure there are no duplicated rows)
        await matchController.insertMatchDetail(matchID, matchList[matchKey][0]);
        await matchController.insertMatchDetail(matchID, matchList[matchKey][1]);
      }

      // send start info to display in frontend
      let startInfo = {
        user1: {
          user: userid1,
          username: userIdNameMapping[userid1]
        },
        user2: {
          user: userid2,
          username: userIdNameMapping[userid2]
        },
        startTime: matchStartTime,
        question: questionObject
      };
      console.log('socket on join, startInfo', startInfo)
      io.to(matchKey).emit('startMatch', startInfo);
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
          output: (childResult)
        };
      } catch (e) {
        // let errorMessage = "Error: Please put in valid code and test data"
        codeResult = {
          user: user,
          output: (e)
        };
      }
      // send an event to everyone in the room including the sender
      io.to(matchKey).emit("codeResult", codeResult);
    });

    socket.on('submit', async (data) => {
      let user = data.user;
      let username = userIdNameMapping[user];

      // Check if the user submitted before
      let submitTime = 0;
      console.log('winnerCheck -------', winnerCheck)
      if (winnerCheck[matchKey]) {
        console.log('winnerCheck[matchKey][0]', winnerCheck[matchKey][0])

        for (let i=0;i<winnerCheck[matchKey].length;i++) {
          if (winnerCheck[matchKey][i].user === user) {
            submitTime += 1;
            console.log('winnerCheck[matchKey][i].user --- ', winnerCheck[matchKey][i].user)
          }
        }
      };
      console.log('submitTime ---', submitTime);
      if (submitTime > 0) {
        socket.emit('alreadySubmitted');
        return;
      }

      let code = data.code;
      let questionObject = await getQuestionDetail(matchKey, true);
      let questionConst = questionObject.const;
      let smallTestCases = questionObject.smallSampleCases;
      let difficulty = questionObject.difficulty;

      // put together the code & run one test case at a time
      let smallTestCasesNumber = smallTestCases.length;
      let smallPassedCasesNumber = 0;
      for (let i=0;i<smallTestCases.length;i++) {
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
          } else {
            console.log(`test case [${i}] failed`)
          }
        } catch (e) {
          console.log(e)
        };
      };

      // 類似的扣：之後跟上面的整理 +++++++++++++++
      let largeTestCases = questionObject.largeSampleCases;
      let largeTestCasesNumber = largeTestCases.length;
      let largePassedCasesNumber = 0;
      let largeTestExecTimeSum = 0;
      let largeExecTimeObj = []; // 這個跟小測資不同！
      for (let i=0;i<largeTestCases.length;i++) {
        let testCaseFinalCode = putTogetherCodeOnSubmit(code, questionConst, largeTestCases[i]);
        // 按不同 user 存到 ./sessions js files
        setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await runCodeInChildProcess(matchKey, user, difficulty, 80);
          
          // give sample test case result
          let childResultSplited = childResult.split('\n');
          let testOutput = childResultSplited[0];
          // get exec time (check if it's ms or s)
          let testExecTime = (childResultSplited[1].slice(-2) == 'ms') ? (childResultSplited[1].split('Time: ')[1].split('m')[0]) : (childResultSplited[1].split('Time: ')[1].split('s')[0]) * 1000;
          let testExpectedOutput = largeTestCases[i].test_result;

          // add sample test result to childResult
          if (testOutput == testExpectedOutput) {
            console.log(`test case [${i}] passed`)
            largePassedCasesNumber += 1;
            largeTestExecTimeSum += parseFloat(testExecTime);
            largeExecTimeObj.push(testExecTime);
          } else {
            console.log(`test case [${i}] failed`);
            largeExecTimeObj.push('failed');
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
      // update match_detail
      await matchController.updateMatchDetail(matchID, user, code, smallCorrectness, largeCorrectness, correctness, largePassed, largeExecTime, performance, answerTime, points);
      
      // update user table: + points (and level table if needed)
      await userController.updateUserPointsLevel(user);

      // update winnerCheck {} for performance points calculation
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

      // fs 刪掉 ./sessions js files
      deleteFile(matchKey, user);

      // check 自己是第幾個 insert match_detail 的人
      let submitNumber = winnerCheck[matchKey].length;

      if (submitNumber < 2) {
        let submitMessage = {
          user,
          message: `${username} submitted the code! We're waiting for your submission.`
        }
        io.to(matchKey).emit('waitForMatchEnd', submitMessage);
        return;
      }
            
      let winner = await getWinner(winnerCheck, matchKey);
      let loser;
      if (winnerCheck[matchKey][0].user === winner) {
        loser = winnerCheck[matchKey][1].user
      } else {
        loser = winnerCheck[matchKey][0].user
      }

      // update match_table: winner
      await matchController.updateMatchWinner(matchKey, winner, loser); 

      io.to(matchKey).emit('endMatch', matchKey);
      console.log('winnerCheck after match', winnerCheck)

      delete winnerCheck[matchKey]
    })

    socket.on(('disconnect' || 'exit'), () => {
      console.log("Socket: a user disconnected");

      // 用 socketidMapping (socketid: user) 找出退出的 user
      let socketid = socket.id;
      let user = socketidMapping[socketid];
      let username = userIdNameMapping[user];
      console.log('-------------------------')
      console.log('socket on disconnect: my socketid', socketid)
      console.log('socket on disconnect: socketidMapping', socketidMapping)
      console.log('socket on disconnect: my userid', user)
      console.log('socket on disconnect: userIdNameMapping', userIdNameMapping)
      console.log('socket on disconnect: my username --- ', username)
      console.log('-------------------------')

      let leaveMessage = {
        user: user,
        message: `${username} left the match for now and might join again. You will still get your points if you submit your solution.`
      }
      io.to(matchKey).emit("joinLeaveMessage", leaveMessage);

      delete socketidMapping[socketid];
      console.log('socketidMapping after deleting disconnected user', socketidMapping);
      delete userIdNameMapping[user];
      console.log('userIdNameMapping after deleting disconnected user', userIdNameMapping);

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
      ls.kill();
      console.log('timeout: killing child process...')
      reject('EXECUTION TIMED OUT');
    }, timeoutMs);
    
    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      // output 性質是 ArrayBuffer 所以要先處理
      result += arrayBufferToStr(data);
    });
    
    ls.stderr.on('data', (data) => {
      let dataStr = arrayBufferToStr(data);
      if (data.includes('out of memory')) {
        ls.kill();
        console.log('out of memory: killing child process...')
        reject('OUT OF MEMORY');
      };
      if (dataStr.includes('Error')) {
        errorMsg = dataStr.split('Error')[0].split('\n').pop(-1) + 'Error' + dataStr.split('Error')[1].split('\n')[0];
        reject(errorMsg);
      };
      if (dataStr.includes('throw')) {
        errorMsg = dataStr.split('throw')[1];
        reject(`throw${errorMsg}`);
      };
      reject('Unknow error')
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
      clearTimeout(setTimeoutId); // clear it or it'll keep timing
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

  console.log('largeThreshold[i].threshold_ms', largeThreshold[0].threshold_ms)
  console.log('largeExecTimeObj', parseInt(largeExecTimeObj[0]))

  for (let i=0; i<largeThreshold.length; i++) {
    if (parseInt(largeExecTimeObj[i]) <= largeThreshold[i].threshold_ms) {
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
    console.log('points_0 > points_1')
  } else if (points_0 < points_1) {
    winner = user_1;
    console.log('points_0 < points_1')
  } else { // same points
    if (answerTime_0 < answerTime_1) {
      winner = user_0;
      console.log('same points, answerTime_0 < answerTime_1')
    } else if (answerTime_0 > answerTime_1) {
      winner = user_1;
      console.log('same points, answerTime_0 > answerTime_1')
    } else {
      winner = 'tie';
      console.log('same points, answerTime_0 = answerTime_1')
    }
  }
  console.log('winner', winner)
  return winner;
}

const arrayBufferToStr = buf => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

module.exports = socket;
