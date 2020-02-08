const fs = require("fs");
const matchController = require('./controllers/matchController');
const questionController = require('./controllers/questionController');


// child process setup for code execution
const { spawn } = require("child_process");

// socket.io setup for live demo
const socketio = require("socket.io");
const socket = {};

socket.init = server => {
  const io = socketio.listen(server);
  const matchList = {};
  const socketidMapping = {};

  io.on("connection", socket => {
    console.log("Socket: a user connected!");

    let url = socket.request.headers.referer;
    let matchKey = getMatchKey(url);
    

    socket.on('submit', () => {
      // get test cases from db
      let testCases = {
        data: [
          {
            case: [[2, 7, 11, 15], 9],
            output: [0,1]
          },
          {
            case: [[20000000, 70000000, 110000000, 150000000000], 180000000],
            output: [1,2]
          },
          {
            case: [[10, 1, 20, 3, 40, 5, 60, 7, 80, 9, 100, 11, 120, 13, 14, 15, 16, 1700, 18, 19, 20], 123],
            output: [3,12]
          },
          {
            case: [[13, 0, 30, 16], 30],
            output: [1,2]
          },
          {
            case: [[-10, 0, 7, -11, -30, 100], 90],
            output: [0,4]
          }
        ]
      };
      // Run all test cases
      let sampleTestCaseArr = testCases.data;
      sampleTestCaseArr.forEach(element => {
        console.log(element.case);
      })
    })



    socket.on("join", async (userName) => {
      
      let user = userName;

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

      // send question details to display
      // get questionID with matchKey
      let questionID = await matchController.getMatchQuestion(matchKey);

      // get question details with questionID
      let getQuestionResult = await questionController.selectQuestion(questionID);

      // get sample test case with questionID
      let sampleCase = await questionController.selectSampleTestCase(questionID);

      let questionObject = {
        question: getQuestionResult.question_name,
        description: getQuestionResult.question_text,
        code: getQuestionResult.question_code,
        difficulty: getQuestionResult.difficulty,
        category: getQuestionResult.category,
        sampleCase: sampleCase.test_data,
        sampleExpected: sampleCase.test_result
      };
      console.log(questionObject)
      io.to(matchKey).emit("questionData", questionObject);

      // send user info to display
      let users = {
        user1: matchList[matchKey][0],
        user2: matchList[matchKey][1]
      };
      io.to(matchKey).emit('startMatch', users);
      

      // update match start time & user2 (when user2 joins)
      let matchID = await matchController.updateMatch(matchKey, user);

      // insert into match_detail
      await matchController.insertMatchDetail(matchID, questionID, matchList[matchKey][0], matchList[matchKey][1]);
      
    });

    // 點 Run Code 會把內容放到 matches，每按一次就顯示在雙方的 terminal
    socket.on("codeObject", async data => {
      let user = data.user;
      let testAll = data.test;
      let test = testAll.split("\n");
      let sampleCaseExpected = data.sampleCaseExpected;

      // +++++++++ get from db!!!!
      let questionCodeConst = "twoSum";

      // put together the code for running
      let finalCode = putTogetherCode(data.code, questionCodeConst, sampleCaseExpected, test)

      // 按不同 user 存到 ./sessions js files
      setUserCodeFile('sessions/', user, finalCode);

      let codeResult = {};
      // Run code in child process
      try {
        let childResult = await childProcessExecFile(user,'sessions/');
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


function setUserCodeFile(path, user, code) {
  let answerFile = fs.openSync(`./${path}${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
  fs.closeSync(answerFile);
};

function putTogetherCode(code, codeConst, expected, test) {

  // expected: get from db!!!!!
  let sampleTestCaseExpected = JSON.stringify(expected);
  console.log('sampleTestCaseExpected -------',sampleTestCaseExpected);

  // exec time calculation
  let finalCode = `console.time('Time');\n${code}\n`;
  // sample test case
  let consoleLogCode = `console.log('Sample test case: '+'${test[0]}');\nlet result_sample = JSON.stringify(${codeConst}(${test[0]}));\nconsole.log('Sample output: '+result_sample);\nconsole.log('Sample expected: '+${sampleTestCaseExpected})`;
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


function childProcessExecFile(user, path) {
  return new Promise((resolve, reject) => {
    let ls = spawn(`node`, [`${path}${user}.js`]);
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
      // reject(data);
    });

    ls.on('error', reject)
      .on('close', code => {
      if (code === 0) {
        resolve(result);
        console.log(`exited child_process at ${path}${user}.js with code ${code}`);
      } else {
        reject(result);
        console.log(`exited child_process at ${path}${user}.js with code ${code}`);
      }
    })
    
  });
}




function getMatchKey(url) {
  let urlSplitedBySlash = url.split("/");
  let key = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  return key;
}

function arrayBufferToStr(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

module.exports = socket;
