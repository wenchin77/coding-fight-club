const fs = require("fs");

// child process setup for code execution
const { execFile } = require('child_process');

// socket.io setup for live demo
const socketio = require('socket.io');
const socket = {};
let user;

socket.init = (server) => {
  const io = socketio.listen(server);
  io.on("connection", socket => {
    console.log("Socket: a user connected");

    // get roomID: 取網址中的參數（暫時由前端設定為現在的時間字串）當作房間號碼
    let url = socket.request.headers.referer;
    let urlSplitedBySlash = url.split('/');
    let urlAfterLastSlash = urlSplitedBySlash[urlSplitedBySlash.length - 1];
    let urlParam = urlAfterLastSlash.split('?');
    let roomID = urlParam[urlParam.length - 2];
    
    // get question
    let urlParamContent = url.split('=');
    let question = urlParamContent[urlParamContent.length - 1];
    let questionCodeConst = 'twoSum';
    
    // 聽到前端丟來的 join 訊息就開一個房間，把 user 丟進去
    socket.on('join', userName => {
      user = userName;
      // 把用戶加入房間名單
      if (!rooms[roomID]) {
        rooms[roomID] = [];
      };
      // +++ 如果超過兩人就不讓用戶進來
      // if(!rooms[roomID])
      rooms[roomID].push(user);

      // enter room
      socket.join(roomID, () => {
        console.log('Room:', user + ' 加入了 ' + roomID);
        console.log('rooms:', rooms);

        // 之後改成去 db 撈完問題內容丟出 question
        questionObject = {
          question: question,
          description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
          code: 'var twoSum = function(nums, target) {};'
        }
        io.to(roomID).emit('questionData', questionObject);

        // +++ 寫進 db match table (先檢查有沒有這筆 match 的資料決定 create OR update)
      });
    });

    // 點 Run Code 會把內容放到 matches，每按一次就顯示在雙方的 terminal
    socket.on('codeObject', data => {
      let code = data.code;      
      let test = data.test;
      matches[roomID] = {
        question: question,
        codeConst: questionCodeConst,
        user: user,
        code: code,
        test: test
      };
      console.log('matches', matches);
      let result = runCode(matches[roomID]);


      // 只發給在房間裡的用戶
      if (rooms[roomID].indexOf(user) === -1) {  
        return false;
      };


      // 回丟一個物件帶有 user 資料以區分是自己還是對手的結果
      let codeResult = {
        user: user,
        result: result
      }

      // send an event to everyone in the room including the sender
      io.to(roomID).emit('codeResult', codeResult);
    });

  
    socket.on("test", msg => {
      console.log("test: ", msg);
    });
  
    socket.on("disconnect", () => {
      console.log("Socket: user disconnected");
    });
  });
}


function runCode(match) {
  let code = match.code;
  let testAll = match.test; // 待處理: 拆成一行一個測試資料，最多五行
  let codeConst = match.codeConst;
  console.log('code ====== ', code);
  console.log('testAll ====== ', testAll);
  console.log('code const ====== ', codeConst);
  let test = testAll.split('\n');
  console.log('test ====== ', test[0]);


  let finalCode = `${code}\n${codeConst}(${test[0]})`
  console.log(finalCode);

  // 按不同 user 存到 ./sessions
  let file = fs.openSync(`./sessions/${user}.js`, 'w');
  fs.writeSync(file, finalCode, encoding='utf-8');
  
  // 在跑各自的資料夾中的子程序

  // // run user's code with user's test cases
  // // send back result & passed or not
  // const child = ('cd sessions');
  // child.on('exit', (code) => {
  //   console.log(`Child process exited with code ${code}`);
  // });
  // child.stdout.on('data', (data) => {
  //     console.log(`Child process --- stdout: ${data}`);
  // });
  // child.stderr.on('data', (data) => {
  //     console.log(`Child process --- stderr: ${data}`);
  // });

  const child = execFile(`sessions/${user}.js`, [], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });

  
  let result;
  return result;
};



// const child_process = require('child_process');
// for(var i=0; i<3; i  ) {
//   var childProcess = child_process.spawn('node', ['node-childPro-spawn.js', i]);  
//   childProcess.stdout.on('data', function (data) {
//     console.log('stdout: '   data);
//   });
//   childProcess.stderr.on('data', function (data) {
//     console.log('stderr: '   data);
//   });
//   childProcess.on('close', function (code) {
//     console.log('子程序已退出，退出碼 ' code);
//   });
// }



module.exports = socket;
