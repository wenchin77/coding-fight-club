const fs = require("fs");

// child process setup for code execution
const { spawn } = require("child_process");

// socket.io setup for live demo
const socketio = require("socket.io");
const socket = {};

socket.init = server => {
  const io = socketio.listen(server);
  const rooms = {};
  const socketidMapping = {};

  io.on("connection", socket => {
    console.log("Socket: a user connected!");

    // get roomID: 取網址中的參數（暫時由前端設定為現在的時間字串）當作房間號碼
    let url = socket.request.headers.referer;
    let roomID = getRoomID(url);
    // get question
    let question = getQuestion(url);
    // 之後改成去 db 撈完問題內容丟出 question
    let questionObject = {
      question: question,
      description: `Given an array of integers, return indices of the two numbers such that they add up to a specific target.
      You may assume that each input would have exactly one solution, and you may not use the same element twice.
      Example:
      Given nums = [2, 7, 11, 15], target = 9,
      Because nums[0] + nums[1] = 2 + 7 = 9,
      return [0,1]`,
      code: `const twoSum = function(nums, target) {
  
};`
    };
    let questionCodeConst = "twoSum";

    socket.on("join", userName => {
      let user = userName;

      // Add a room if it doesn't exist
      if (!rooms[roomID]) {
        rooms[roomID] = [];
      };

      // Reject a user if there are already 2 people in the room
      if (rooms[roomID].length >= 2) {
        socket.emit('rejectUser', 'Oops, there are already two people in this match!');
        return;
      }

      // Add user to the room
      rooms[roomID].push(user);

      // Add user to socketidMapping (socketid: user)
      if (!socketidMapping[socket.id]) {
        socketidMapping[socket.id] = user;
      };

      // Send question data to frontend
      socket.emit("questionData", questionObject);

      // Join room
      socket.join(roomID, () => {
        console.log(`Socket: ${user} 加入了 ${roomID} (socket.id = ${socket.id})`);
        console.log('Rooms: ', rooms);
        let joinMessage = {
          user: user,
          message: `${user} joined the match.`
        }
        io.to(roomID).emit('joinLeaveMessage', joinMessage);
        
        // +++ 寫進 db match table (先檢查有沒有這筆 match 的資料決定 create OR update)
      });

      // Wait for opponent if there's only 1 person in the room
      if (rooms[roomID].length === 1) {
        socket.emit('waitForOpponent', 'Hold on. We are waiting for your opponent to join...');
        return;
      };

      // Start match when there are 2 people in the room
      let users = {
        user1: rooms[roomID][0],
        user2: rooms[roomID][1]
      };
      io.to(roomID).emit('startMatch', users);
      
    });

    // 點 Run Code 會把內容放到 matches，每按一次就顯示在雙方的 terminal
    socket.on("codeObject", async data => {
      let user = data.user;
      let testAll = data.test;
      let test = testAll.split("\n");
      

      // put together the code for running
      let finalCode = `console.time('Time');\n${data.code}\n${createConsoleLogCode('Output', questionCodeConst, test)}\nconsole.timeEnd('Time');`;

      // 按不同 user 存到 ./sessions js files
      setUserCodeFile('sessions/answers/', user, finalCode);

      let codeResult = {};
      // Run code in child process
      try {
        let childResult = await childProcessExecFile(user,'sessions/answers/');

        // 回丟一個物件帶有 user 資料以區分是自己還是對手的結果
        codeResult = {
          user: user,
          output: childResult
        };
        console.log('codeResult', codeResult);
      } catch (e) {
        let errorMessage = "[Error] Please put in valid code and test data"
        console.log("RUN CODE ERROR -----------> ", e);
        codeResult = {
          user: user,
          output: errorMessage
        };
      }
      // send an event to everyone in the room including the sender
      io.to(roomID).emit("codeResult", codeResult);
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
      io.to(roomID).emit("joinLeaveMessage", leaveMessage);

      // 刪掉該用戶的 property
      delete socketidMapping[socketid];

      if (rooms[roomID]) {
        let index = rooms[roomID].indexOf(user);
        if (index !== -1) {
          // drop user at index
          rooms[roomID].splice(index, 1);
          if (rooms[roomID].length === 0) {
            // drop room property if it's empty
            delete rooms[roomID];
          }
        }
        socket.leave(roomID); // 退出房間
        console.log(`Socket: ${user} 退出了 ${roomID} (socket.id ${socket.id})`);
      }

    });
  });
};


function setUserCodeFile(path, user, code) {
  let answerFile = fs.openSync(`./${path}${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
  fs.closeSync(answerFile);
};

function createConsoleLogCode(outputName, codeConst, test) {
  let consoleLogCode = `console.log('[${outputName}] '+${codeConst}(${test[0]}));`;
  for (i=1; i<5; i++) {
    if (test[i] && test[i]!==''){
      consoleLogCode += `\nconsole.log('[${outputName}] '+${codeConst}(${test[i]}));`
    }
  };
  return consoleLogCode;
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
      console.error(`stderr: ${data}`);
      reject(data);
    });
    
    ls.on('close', (code) => {
      // 子程序終止的時候再回傳上面組的內容
      resolve(result);
      console.log(`exited child_process at ${path}${user}.js with code ${code}`);
    });
  });
}


function getRoomID(url) {
  let urlSplitedBySlash = url.split("/");
  let urlAfterLastSlash = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  let urlParam = urlAfterLastSlash.split("?");
  let roomID = urlParam[urlParam.length - 2];
  return roomID;
}

function getQuestion(url) {
  let urlParamContent = url.split("=");
  let question = urlParamContent[urlParamContent.length - 1];
  return question;
}

function arrayBufferToStr(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

module.exports = socket;
