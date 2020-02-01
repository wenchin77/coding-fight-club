const fs = require("fs");

// child process setup for code execution
const execFileSync = require('child_process').execFile;

// socket.io setup for live demo
const socketio = require('socket.io');
const socket = {};

socket.init = (server) => {
  const io = socketio.listen(server);
  // 空的物件準備接所有 room 的內容
  const rooms = {};
  let user;

  io.on("connection", socket => {
    console.log('Socket: a user connected!');
    
    // get roomID: 取網址中的參數（暫時由前端設定為現在的時間字串）當作房間號碼
    let url = socket.request.headers.referer;
    let roomID = getRoomID(url);
    // get question
    let question = getQuestion(url);
    // 之後改成去 db 撈完問題內容丟出 question
    let questionCodeConst = 'twoSum'; // +++ get this from db
    let questionObject = {
      question: question,
      description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n\nExample:\n\nGiven nums = [2, 7, 11, 15], target = 9,\n\nBecause nums[0] + nums[1] = 2 + 7 = 9,\n\nreturn [0,1]',
      code: 'var twoSum = function(nums, target) {};'
    }
    
    socket.on('join', userName => {
      user = userName;
      // 把用戶加入房間名單
      if (!rooms[roomID]) {
        rooms[roomID] = [];
      };
      // +++ 如果超過兩人就不讓用戶進來
      rooms[roomID].push(user);

      // join room
      socket.join(roomID, () => {
        console.log('Room:', user + ' 加入了 ' + roomID);
        console.log('rooms:', rooms);
        // 跟前端說 question 是啥
        io.to(roomID).emit('questionData', questionObject);

        // +++ 寫進 db match table (先檢查有沒有這筆 match 的資料決定 create OR update)
      });
      
    });

    // 點 Run Code 會把內容放到 matches，每按一次就顯示在雙方的 terminal
    socket.on('codeObject', async (data) => {
      let user = data.user;

      // // 按不同 user 存到 ./sessions js files
      // let file = fs.openSync(`./sessions/${user}.js`, 'w');
      // fs.writeSync(file, finalCode, encoding='utf-8');
      
      // Run code in child process
      try{
        let finalCode = await createFinalCode(data, questionCodeConst);
        let file = await createFile(user, finalCode);
        
        let childResult = await childProcessExecFile(user);
        console.log('childResult ===', childResult);

        // 回丟一個物件帶有 user 資料以區分是自己還是對手的結果
        let codeResult = {
          user: user,
          result: childResult
        };
        console.log('codeResult', codeResult);
        // send an event to everyone in the room including the sender
        io.to(roomID).emit('codeResult', codeResult);

      } catch (e) {
        console.log('ERROR 底加 -----------> ', e)
        let codeResult = {
          user: user,
          result: '[Error] please put in valid code and test data'
        };
        io.to(roomID).emit('codeResult', codeResult);
      }
    });


    socket.on('exit', () => {
      socket.emit('disconnect');
    });

    // BUG: user 會抓錯 ==========================
    socket.on('disconnect', () => {
      console.log('Socket: a user disconnected')
      // 把人從房間移除
      console.log('Current rooms: ', rooms);
      if (rooms[roomID]) {
        let index = rooms[roomID].indexOf(user);
        if (index !== -1) {
          // drop 1 element at index
          rooms[roomID].splice(index, 1);
        }
        socket.leave(roomID);    // 退出房間
        // io.to(roomID).emit('sys', user + '退出了房间', rooms[roomID]);
        console.log('Socket: ' + user + '退出了' + roomID);
      };
    });
  });
}


function createFinalCode(data, questionCodeConst){
  return new Promise((resolve, reject) => {
    let testAll = data.test;
    let test = testAll.split('\n');
    console.log('test[0]',test[0]);
  
    // put together the code for running
    let finalCode = `${data.code}\n\nconsole.log('Output 1: '+${questionCodeConst}(${test[0]}));
    console.log('Output 2: '+${questionCodeConst}(${test[1]}));
    console.log('Output 3: '+${questionCodeConst}(${test[2]}));
    console.log('Output 4: '+${questionCodeConst}(${test[3]}));
    console.log('Output 5: '+${questionCodeConst}(${test[4]}));`
    console.log('==============================')
    console.log(finalCode);
    console.log('==============================');
    resolve(finalCode);
  });
}

function createFile(user, finalCode){
  return new Promise((resolve, reject) => {
    // 按不同 user 存到 ./sessions js files
    let file = fs.openSync(`./sessions/${user}.js`, 'w');
    resolve(fs.writeSync(file, finalCode, encoding='utf-8'));
  })
}


function childProcessExecFile(user) {
  return new Promise ((resolve, reject) => {
    const child = execFileSync('node', [`sessions/${user}.js`], (error, stdout, stderr) => {
      if (error) {
          console.error('stderr', stderr);
          reject(error);
      }
      console.log('stdout', stdout);
      resolve(stdout);
    });
  }) 
}

function getRoomID(url) {
  let urlSplitedBySlash = url.split('/');
  let urlAfterLastSlash = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  let urlParam = urlAfterLastSlash.split('?');
  let roomID = urlParam[urlParam.length - 2];
  return roomID;
}

function getQuestion(url) {
  let urlParamContent = url.split('=');
  let question = urlParamContent[urlParamContent.length - 1];
  return question;
};

module.exports = socket;
