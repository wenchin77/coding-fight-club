// socket.io setup for live demo
const socketio = require('socket.io');
const socket = {};

socket.init = (server) => {
  const io = socketio.listen(server);
  // 空的物件準備接所有 room 的內容
  const rooms = {};
  // 空的物件準備接所有 match 的內容: each room's latest code & test
  const matches = {};

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

    let user;
    
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
        // 之後改成去 db 撈完問題內容丟出 question
        let tempQuestionDescription = 'Given an array of integers, return indices of the two numbers such that they add up to a specific target. You may assume that each input would have exactly one solution, and you may not use the same element twice.'
        let questionCode = 'var twoSum = function(nums, target) {};'
        io.to(roomID).emit('questionData', question, tempQuestionDescription, questionCode);
        console.log('Room:', user + ' 加入了 ' + roomID);
        console.log('rooms:', rooms);

        // +++ 寫進 db match table (先檢查有沒有這筆 match 的資料決定 create OR update)
      });
    });

    // 點 Run Code 會把內容放到 matches，每按一次就顯示在雙方的 terminal
    socket.on('codeObject', data => {
      let code = data.code;      
      let testAll = data.test; // 待處理（拆成一行一個測試資料，最多五行）
      matches[roomID] = {
        question: question,
        questionCodeConst: questionCodeConst,
        user: user,
        code: code,
        test: testAll
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


    socket.on('exit', () => {
      socket.emit('disconnect');
    });


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


function runCode(match) {
  console.log('code ====== ', match.code);
  console.log('test ====== ', match.test);
  // run user's code with user's test cases
  // send back result & passed or not
  let result;
  return result;
}

module.exports = socket;
