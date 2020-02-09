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
  const matchList = {}; // to be deleted & transferred to db
  const socketidMapping = {};

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
        console.log(`Socket: ${user} 加入了 ${matchKey} (socket.id = ${socket.id})`);
        console.log('matchList: ', matchList);
        let joinMessage = {
          user: user,
          message: `${user} joined the match.`
        }
        io.to(matchKey).emit('joinLeaveMessage', joinMessage);
        
        // +++ modify match table (先檢查有沒有這筆 match 的資料決定 create OR update)
      });

      // Wait for opponent if there's only 1 person in the room
      if (matchList[matchKey].length === 1) {
        socket.emit('waitForOpponent', 'Hold on. We are waiting for your opponent to join...');
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
      let questionID = questionObject.questionID;
      await matchController.insertMatchDetail(matchID, questionID, matchList[matchKey][0]);
      await matchController.insertMatchDetail(matchID, questionID, matchList[matchKey][1]);
      
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
      let finalCode = putTogetherCodeOnRun(code, questionConst, sampleCaseExpected, test)

      // 按不同 user 存到 ./sessions js files
      setUserCodeFile(matchKey, user, finalCode);

      let codeResult = {};
      // Run code in child process
      try {
        let childResult = await runCodeInChildProcess(matchKey, user, difficulty);
        console.log('childResult===', childResult);
        
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
          output: childResult
        };
      } catch (e) {
        // let errorMessage = "Error: Please put in valid code and test data"
        codeResult = {
          user: user,
          output: e
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
      let testCases = questionObject.sampleCases;
      let difficulty = questionObject.difficulty;

      // put together the code & run one test case at a time
      let testCasesNumber = testCases.length;
      let passedCasesNumber = 0;
      let testExecTimeSum = 0;
      let testCasesResult =''; // 改成寫到 match_result page 的 ajax!!!!!!!!
      for (i=0;i<testCases.length;i++) {
        let testCaseFinalCode = putTogetherCodeOnSubmit(code, questionConst, testCases[i]);
        // 按不同 user 存到 ./sessions js files
        setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await runCodeInChildProcess(matchKey, user, difficulty);
          console.log(`childResult ${i} =============== `);
          
          // give sample test case result
          let childResultSplited = childResult.split('\n');
          let testOutput = childResultSplited[0];
          let testExecTime = childResultSplited[1].split('Time: ')[1].split('ms')[0];
          let testExpectedOutput = testCases[i].test_result;
  
          // add sample test result to childResult
          if (testOutput == testExpectedOutput) {
            console.log(`test case [${i}] passed`)
            passedCasesNumber += 1;
            testExecTimeSum += parseFloat(testExecTime);
            testCasesResult += `TEST PASSED\nValue equals ${testExpectedOutput}\n\n`;
          } else {
            console.log(`test case [${i}] failed`)
            testCasesResult += `TEST FAILED\nExpected: ${testExpectedOutput}, instead got: ${testOutput}\n\n`;
          }
        } catch (e) {
          console.log(e)
        };
      };
      
      console.log('testCasesResult', testCasesResult)

      // calculate passed test cases
      let correctness = passedCasesNumber/testCasesNumber;

      // calculate exec time (counting with passed tests only)
      let execTime;
      if (passedCasesNumber === 0) {
        execTime = null;
      } else {
        execTime = testExecTimeSum/passedCasesNumber;
      }

      // calculate answer time
      let startTime = await matchController.getMatchStartTime(matchKey);
      let answerTime = (Date.now() - startTime)/1000; // in seconds



      // 紀錄 code 跟項目評分在 match_detail
      let matchID = await matchController.getMatchId(matchKey);
      await matchController.updateMatchDetail(matchID, user, code, correctness, execTime, answerTime);
      
      // get questionID with matchKey
      let questionID = await matchController.getMatchQuestion(matchKey);
      // performance 拉之前寫過這題的所有 execTime，看分布在哪
      let pastExecTime = await matchController.getMatchDetailPastExecTime(questionID);
      for (i=0; i<pastExecTime.length; i++) {
        console.log(pastExecTime[i].exec_time);
      }

      // +++++++ update performance & points

      // +++++++ 更新兩人的 user table: points (and level table if needed)

      // fs 刪掉 ./sessions js files



      // check 自己是第幾個 insert match_detail 的人
      let submitNumber = await matchController.getSubmitNumber(matchID);
      console.log('submitNumber', submitNumber);

      if (submitNumber < 2) {
        // 如果自己是第一個：給等待訊息
        let submitMessage = {
          user,
          message: `${user} submitted the code! We're waiting for your submission.`
        }
        io.to(matchKey).emit('waitForMatchEnd', submitMessage);
        return;
      }
      
      // 如果第二
      socket.emit('testCasesResult', testCasesResult)
      io.to(matchKey).emit('endMatch', matchKey, testCasesResult);
      
    })

    socket.on(('disconnect' || 'exit'), () => {
      console.log("Socket: a user disconnected");

      // 用 socketidMapping (socketid: user) 找出退出的 user
      let socketid = socket.id;
      let user = socketidMapping[socketid];

      let leaveMessage = {
        user: user,
        message: `${user} left the match.`
      }
      io.to(matchKey).emit("joinLeaveMessage", leaveMessage);

      // 刪掉該用戶的 property
      delete socketidMapping[socketid];

      if (matchList[matchKey]) {
        let index = matchList[matchKey].indexOf(user);
        if (index !== -1) {
          // drop user at index
          matchList[matchKey].splice(index, 1);
          if (matchList[matchKey].length === 0) {
            // drop room property if it's empty
            delete matchList[matchKey];
          }
        }
        socket.leave(matchKey); // 退出房間
        console.log(`Socket: ${user} 退出了 ${matchKey} (socket.id ${socket.id})`);
      }

    });
  });
};


const setUserCodeFile = (matchKey, user, code) => {
  let answerFile = fs.openSync(`./sessions/${matchKey}_${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
  fs.closeSync(answerFile);
};

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
  let testCase = sampleCase.test_data;
  // exec time calculation
  let finalCode = `console.time('Time');\n${code}\nconsole.log(JSON.stringify(${questionConst}(${testCase})))`;
  // format
  finalCode += `\nconsole.timeEnd('Time');`;
  return finalCode;
};

const getQuestionDetail = async (matchKey, submitBoolean) => {
  // get questionID with matchKey
  let questionID = await matchController.getMatchQuestion(matchKey);
  // get question details with questionID
  let getQuestionResult = await questionController.selectQuestion(questionID);
  // get sample test case with questionID
  let sampleCases = await questionController.selectSampleTestCases(questionID);
  
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
    let sampleCase = sampleCases[0];
    questionObject.sampleCase = sampleCase.test_data;
    questionObject.sampleExpected = sampleCase.test_result;
    return questionObject;
  };

  // senario: a user submits (send sampleCases)
  questionObject.sampleCases = sampleCases;
  return questionObject;
}


const runCodeInChildProcess = (matchKey, user, difficulty) => {
  return new Promise((resolve, reject) => {
    let ls = spawn(`node`, [`./sessions/${matchKey}_${user}.js`]);
    let result = '';
    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      // output 性質是 ArrayBuffer 所以要先處理
      // 等每個 output 出來組在一起
      result += arrayBufferToStr(data);
    });
    
    ls.stderr.on('data', (data) => {
      result += arrayBufferToStr(data);
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
    });

    // timeout error setting
    let timeoutMs = getTimeoutMs(difficulty);
    setTimeout(() => {
      ls.kill();
      reject('EXECUTION TIMED OUT');
    }, timeoutMs);
    
  });
}

const getTimeoutMs = difficulty => {
  if(difficulty === 'easy') {
    return 3000;
  } else if (difficulty === 'medium') {
    return 6000;
  }
  return 10000;
}


const getMatchKey = url => {
  let urlSplitedBySlash = url.split("/");
  let key = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  return key;
}

const arrayBufferToStr = buf => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

module.exports = socket;
