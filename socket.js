// socket.io setup for live demo
const socketio = require('socket.io');
const socket = {};


socket.init = (server) => {
  const io = socketio.listen(server);
  const roomInfo = {};

  io.on("connection", socket => {
    console.log("Socket: a user connected");

    // 取網址中的參數（暫時由前端設定為現在的時間字串）當作房間號碼
    let url = socket.request.headers.referer;
    let splited = url.split('/');
    let roomID = splited[splited.length -1];
    let user;
    let question;

    socket.on("matchSetup", obj => {
      console.log("matchSetup", obj);
      question = obj.question;


      // 之後加上：寫進 db match table (先檢查有沒有這筆 match 的資料決定 create OR update)
    });

    socket.on('join', userName => {
      user = userName;
      // 把用戶加入房間名單
      if (!roomInfo[roomID]) {
        roomInfo[roomID] = [];
      };
      // if(!roomInfo[roomID])
      roomInfo[roomID].push(user);

      // enter room
      socket.join(roomID, () => {
        io.to(roomID).emit('match', roomID);
        console.log('Room:', user + ' 加入了 ' + roomID);
        console.log('roomInfo:', roomInfo);
      });
    });

    socket.on('codeObject', (data) => {
      console.log('data: ',data);
      let userName = data.name;
      // 只發給在房間裡的用戶
      if (roomInfo[roomID].indexOf(userName) === -1) {  
        return false;
      };
      // send an event to everyone in the room including the sender
      io.to(roomID).emit('codeResult', 'example result');
    });

  
    socket.on("test", msg => {
      console.log("test: ", msg);
    });


    socket.on('exit', () => {
      socket.emit('disconnect');
    });

    
    socket.on('disconnect', () => {
      // 把人從房間移除
      let index = roomInfo[roomID].indexOf(user);
      if (index !== -1) {
        roomInfo[roomID].splice(index, 1);
      }
      socket.leave(roomID);    // 退出房間
      io.to(roomID).emit('sys', user + '退出了房间', roomInfo[roomID]);
      console.log('Socket: ' + user + '退出了' + roomID);
    });
  });
}


function runCode() {
  // run user's code with user's test cases
  // send back result
}

module.exports = socket;
