const fs = require("fs");

// child process setup for code execution
const { execFile } = require("child_process");

// socket.io setup for live demo
const socketio = require("socket.io");
const socket = {};

socket.init = server => {
  const io = socketio.listen(server);
  // 空的物件準備接所有 room 的內容
  const rooms = {};
  let user;

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
    let answerCode = `const twoSum = function(nums, target) {
      const comp = {};
      for(let i=0; i<nums.length; i++){
          if(comp[nums[i]]>=0){
              return [ comp[nums[i] ], i]
          }
          comp[target-nums[i]] = i
      }
    };`;

    socket.on("join", userName => {
      user = userName;
      // 把用戶加入房間名單
      if (!rooms[roomID]) {
        rooms[roomID] = [];
      }
      // +++ 如果超過兩人就不讓用戶進來
      rooms[roomID].push(user);

      // join room
      socket.join(roomID, () => {
        console.log("Room:", user + " 加入了 " + roomID);
        console.log("rooms:", rooms);
        // 跟前端說 question 是啥
        io.to(roomID).emit("questionData", questionObject);

        // +++ 寫進 db match table (先檢查有沒有這筆 match 的資料決定 create OR update)
      });
    });

    // 點 Run Code 會把內容放到 matches，每按一次就顯示在雙方的 terminal
    socket.on("codeObject", async data => {
      let user = data.user;
      let testAll = data.test;
      let test = testAll.split("\n");

      function createConsoleLogCode(outputName) {
        let consoleLogCode = `console.log('[${outputName}] '+${questionCodeConst}(${test[0]}));`;
        for (i=1; i<5; i++) {
          if (test[i] && test[i]!==''){
            consoleLogCode += `\nconsole.log('[${outputName}] '+${questionCodeConst}(${test[i]}));`
          }
        };
        return consoleLogCode;
      };

      // put together the code for running
      let finalCode = `${data.code}\n${createConsoleLogCode('Output')}`;
      let answerCheckFinalCode = `${answerCode}\n${createConsoleLogCode('Expected')}`;

      // 按不同 user 存到 ./sessions js files
      setUserCodeFile('sessions/answers/', user, finalCode);
      setUserCodeFile('sessions/answerCheck/', user, answerCheckFinalCode);

      // Run code in child process
      try {
        let childResult = await childProcessExecFile(user,'sessions/answers/');
        let answerCheckResult = await childProcessExecFile(user, 'sessions/answerCheck/');
        console.log('childResult === ', childResult);
        console.log('answerCheckResult === ', answerCheckResult);

        // 回丟一個物件帶有 user 資料以區分是自己還是對手的結果
        let codeResult = {
          user: user,
          result: `${childResult}\n${answerCheckResult}`
        };
        console.log("codeResult", codeResult);
        // send an event to everyone in the room including the sender
        io.to(roomID).emit("codeResult", codeResult);
      } catch (e) {
        let errorMessage = "[Error]: please put in valid code and test data"
        console.log("RUN CODE ERROR 底加 -----------> ", e);
        let codeResult = {
          user: user,
          result: errorMessage
        };
        io.to(roomID).emit("codeResult", codeResult);
      }
    });

    socket.on("exit", () => {
      socket.emit("disconnect");
    });

    // BUG: user 會抓錯 ==========================
    socket.on("disconnect", () => {
      console.log("Socket: a user disconnected");
      // 把人從房間移除
      console.log("Current rooms: ", rooms);
      if (rooms[roomID]) {
        let index = rooms[roomID].indexOf(user);
        if (index !== -1) {
          // drop 1 element at index
          rooms[roomID].splice(index, 1);
        }
        socket.leave(roomID); // 退出房間
        // io.to(roomID).emit('sys', user + '退出了房间', rooms[roomID]);
        console.log("Socket: " + user + " 退出了 " + roomID);
      }
    });
  });
};


function setUserCodeFile(path, user, code) {
  let answerFile = fs.openSync(`./${path}${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
}


function childProcessExecFile(user, path) {
  return new Promise((resolve, reject) => {
    let child = execFile("node", [`${path}${user}.js`], (error, stdout, stderr) => {
        if (error) {
          console.error("stderr ", path, stderr);
          reject(error);
        }
        console.log("stdout ", path, stdout);
        resolve(stdout);
      }
    );
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

module.exports = socket;
