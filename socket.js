const fs = require("fs");
const matchController = require('./controllers/matchController');
const questionController = require('./controllers/questionController');
const userController = require('./controllers/userController');

// child process setup for code execution
const { spawn } = require("child_process");

// socket.io setup for live terminal result
const socketio = require("socket.io");
const socket = {};

// online user check data
const onlineUsers = {};
const tokenIdMapping = {};

socket.init = server => {
  console.log('socket server initialized...');

  const io = socketio.listen(server);
  
  // match data
  const matchList = {}; // to save match key & user mapping info
  const socketidMapping = {}; // to save socketid & user mapping info
  const winnerCheck = {}; // on submit: to assign performance points
  
  io.on("connection", socket => {
    let url = socket.request.headers.referer;
    console.group('---------> io on connection', socket.id);
    console.log('user connected at', url);
    console.log('io on connetion, socketidMapping: ', socketidMapping);
    console.groupEnd();


    socket.on('online', async (token) => {
      console.group('---------> online', socket.id);
      let user;
      let username;

      // get userid & username in db if it's not in memory
      if (!tokenIdMapping[token]) {
        console.log('沒有這個用戶資料在 onlineUsers, 進去 db 找');
        let result = await userController.selectUserInfoByToken(token);
        user = result[0].id;
        username = result[0].user_name;
        tokenIdMapping[token] = user;
        onlineUsers[user] = {
          username,
          time: Date.now(),
          inviting: 0, // if it's 1 user can't invite again
          invitation_accepted: 0,
          invited: []
        };
      } else {
        user = tokenIdMapping[token];
        // ++++++++++++++++ to be debugged: username undefined sometimes?
        username = onlineUsers[user].username;
        console.log('有用戶資料，onlineUsers',onlineUsers)
      }

      // Add user to socketidMapping (socketid: userid)
      if (!socketidMapping[socket.id]) {
        socketidMapping[socket.id] = user;
      };
      console.log('socket on online, socketidMapping: ', socketidMapping);

      // update active time
      onlineUsers[user].time = Date.now();
      // console.log('socket on online, onlineUsers', onlineUsers);

      // if the invitation's accepted notify the inviter
      if (onlineUsers[user].invitation_accepted !== 0) {
        console.log('invitation_accepted === 1, emitting startStrangerModeMatch...')
        socket.emit('startStrangerModeMatch', onlineUsers[user].invitation_accepted);
      }

      // if there's an invitation notify the invited
      let onlineUserDetail = onlineUsers[user];
      if (onlineUserDetail.invited.length > 0) {
        console.log('onlineUserDetail ====',onlineUserDetail);
        let invitations =  onlineUserDetail.invited;
        for (let i=0; i<invitations.length; i++) {
          console.log(invitations[i])
          console.log('emitting invited...')
          socket.emit('invited', invitations[i]);
        }
      }
      console.groupEnd();

    })

    socket.on('joinMatch', async (token) => {
      console.group('---------> joinMatch')
      let matchKey = getMatchKey(socket.request.headers.referer);
      let user;
      let username;

      // get userid & username in db if it's not in memory
      if (!tokenIdMapping[token]) {
        console.log('!onlineUsers[token], 進去 db 找');
        let result = await userController.selectUserInfoByToken(token);
        user = result[0].id;
        username = result[0].user_name;
        tokenIdMapping[token] = user;
        onlineUsers[user] = {
          username,
          time: Date.now(),
          inviting: 0, // if it's 1 user can't invite again
          invitation_accepted: 0,
          invited: []
        };
      } else {
        user = tokenIdMapping[token];
        console.log('user', user)
        // ++++++++++++++++ to be debugged: username undefined sometimes?
        console.log('onlineUsers',onlineUsers)
        username = onlineUsers[user].username;
        console.log('username', username)
      }

      // Add a room if it doesn't exist
      if (!matchList[matchKey]) {
        matchList[matchKey] = [];
      };

      // +++++++++ watch mode?
      // Reject user if there are already 2 people in the room
      if (matchList[matchKey].length >= 2) {
        console.log('---------> rejectUser')
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
          username: onlineUsers[userid1].username
        },
        user2: {
          user: userid2,
          username: onlineUsers[userid2].username
        },
        startTime: matchStartTime,
        question: questionObject
      };
      console.log('socket on join, startInfo', startInfo)
      io.to(matchKey).emit('startMatch', startInfo);
      console.groupEnd();
    });

    socket.on('runCode', async (data) => {
      console.group('---------> runCode')
      let matchKey = getMatchKey(socket.request.headers.referer);
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
      console.groupEnd();
    });

    socket.on('submit', async (data) => {
      console.group('---------> submit')
      let matchKey = getMatchKey(socket.request.headers.referer);
      let user = data.user;
      let username = onlineUsers[user].username;

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
      console.groupEnd();

    })

    socket.on('getStranger', async (data) => { // data: {token, category, difficulty}
      console.group('---------> getStranger')
      let token = data.token;
      let inviterId = tokenIdMapping[token];
      let inviterName = onlineUsers[inviterId].username;
      if ((Date.now() - onlineUsers[inviterId].inviting) < 60 * 1000) {
        socket.emit('noStranger','You cannot send more than one invitation within a minute!')
        return;
      }

      let result = await getStranger(onlineUsers, inviterId);
      if (!result) {
        socket.emit('noStranger','Ugh everyone seems to be busy playing in matches right now. Try again later or invite a friend instead?')
        return;
      }
      console.log('stranger result', result);
      // add to invitations 
      let invitation = {
        inviter: inviterId,
        inviterName,
        category: data.category,
        difficulty: data.difficulty,
        time: Date.now()
      }
      console.log('invitation', invitation)
      onlineUsers[result.strangerId].invited.push(invitation);

      // update inviter's data
      onlineUsers[inviterId].inviting = Date.now();
      
      console.log('socket on getStranger, onlineUsers',onlineUsers)
      socket.emit('stranger', invitation);
      console.groupEnd();
    });

    socket.on('strangerAccepted', (data) => {
      console.group('---------> strangerAccepted')
      let id = data.inviterId;
      console.log('data', data)
      onlineUsers[id].invitation_accepted = data.url;
      console.log('onlineUsers[id]', onlineUsers[id])
      console.groupEnd();
    });

    socket.on('strangerRejected', (data) => {
      console.group('---------> strangerRejected')
      let token = data.token;
      let user = tokenIdMapping[token];
      let inviterId = data.inviterId;
      for (let i=0; i<onlineUsers[user].invited.length; i++) {
        if (onlineUsers[user].invited[i].inviter == id) {
          array.splice(i, 1);
          break;
        }
      }
      onlineUsers[inviterId].invited = 0;
      console.log('onlineUsers after strangerRejected ---- ', onlineUsers);

      console.groupEnd();
    })

    socket.on(('disconnect' || 'exit'), () => {
      console.log('---------> disconnect', socket.id)
      let url = socket.request.headers.referer;
      let socketid = socket.id;
      let user = socketidMapping[socketid];
      console.log('disconnect user',user)
      console.log('disconnect onlineUsers', onlineUsers)
      console.log('disconnect socketidMapping', socketidMapping)
      let username = onlineUsers[user].username;

      // match page
      if (url.includes('/match/')){
        let matchKey = getMatchKey(url);

        // 用 socketidMapping (socketid: user) 找出退出的 user
        console.log('match page socket on disconnect: my socketid', socketid)
        console.log('match page socket on disconnect: my userid', user)
        console.log('match page socket on disconnect: my username', username)
        console.log('match page socket on disconnect: socketidMapping', socketidMapping)
        console.log('match page socket on disconnect: onlineUsers', onlineUsers)


        // ++++++++++++++ 不要傳送第三者離開的訊息？？
        // let match = matchList[matchKey];
        // let matchUser1 = match[0];
        // let matchUser2 = match[1];
        // if ((matchUser1 !== user) && (matchUser2 !== user)) {
        //   console.log('someone not in the match left...')
        //   return;
        // }
  
        let leaveMessage = {
          user: user,
          message: `${username} left the match and might join again. You will still get your points if you submit your solution.`
        }
        io.to(matchKey).emit("joinLeaveMessage", leaveMessage);
  
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
      };

      // other pages
      console.log('user disconnected at', url);
      // +++++++++++ leave onlineUsers

      // // client 會自動斷線，所以 mapping 不能亂刪??????c
      // delete onlineUsers[user];
      // console.log('onlineUsers after deleting disconnected user', onlineUsers);

      delete socketidMapping[socketid];
      console.log('socketidMapping after deleting disconnected user', socketidMapping);
      console.groupEnd();
    });
  });
};


// remove timeout users (1 min with no ping) in onlineUserList
// check every 60 sec
setInterval(() => {
  console.log('in setInterval')
  for (let prop in onlineUsers) {
    if((Date.now() - onlineUsers[prop].time) > 1000*60) {
      delete onlineUsers[prop];
      console.log('deleting user in onlineUsers...')
    }
  }
  console.log('onlineUsers in setInterval === ',onlineUsers);
}, 1000*60); // 之後調整成長一點

let getStranger = (obj, inviterId) => {
  let keys = Object.keys(obj);
  if (keys.length <= 1) {
    console.log('only 1 user online now...')
    return false;
  }
  let index = keys.length * Math.random() << 0;
  console.log('index', index)
  let strangerId = parseInt(keys[index]);
  console.log('strangerId',strangerId)
  console.log('inviterId (my id)', inviterId)
  if (strangerId === inviterId) {
    console.log('token belongs to me, find the next person')
    // if token belongs to me, find the next person 
    let newIndex = (index+1)%keys.length
    console.log('newIndex', newIndex)
    let newResult = obj[keys[newIndex]];
    let newStrangerId = keys[newIndex];
    console.log({result: newResult, strangerId: newStrangerId})
    return ({result: newResult, strangerId: newStrangerId});
  } else {
    let result = obj[strangerId];
    console.log({result, strangerId})
    return ({result, strangerId});
  }
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
