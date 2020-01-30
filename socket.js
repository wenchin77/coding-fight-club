// socket.io setup for live demo
const socketio = require('socket.io');
const socket = {};


socket.init = (server) => {
  const io = socketio.listen(server);
  io.on("connection", socket => {
    console.log("Socket: a user connected");

    const roomInfo = {};

    // 取網址中的參數（暫時由前端設定為現在的時間字串）當作房間號碼
    let url = socket.request.headers.referer;
    let splited = url.split('/');
    let roomID = splited[splited.length -1];
    let user ='';
    socket.on('join_room', userName => {
      user = userName;
      // 把用戶加入房間名單
      if (!roomInfo[roomID]) {
        roomInfo[roomID] = [];
      }
      roomInfo[roomID].push(user);

      // enter room
      socket.join(roomID, () => {
        let rooms = Object.keys(socket.rooms);
        console.log('Rooms', rooms);
        console.log('Room:', user + ' 加入了 ' + roomID);
      });
    });

    socket.on('codeObject', ({userName, data}) => {
      // console.log('data: ', data)
      // const code = data.code;
      // console.log('code: ', code);
      console.log('username: ',userName);
      console.log('data: ',data);
      // 只發給在房間裡的用戶
      if (roomInfo[roomID].indexOf(userName) === -1) {  
        return false;
      }

      socket.to(roomID).emit('codeResult', 'example result');
    })



    // // 接收
    // socket.on("codeObject", data => {
    //   console.log('data: ', data)
    //   const code = data.code;
    //   console.log('code: ', code);

    //   // 傳到自己的 terminal
    //   socket.emit("codeResult", `You wrote: ${code}`);
    //   // 傳到對手的 terminal

    // });

    socket.on("matchObject", obj => {
      console.log("matchObject", obj);
      // 之後加上：寫進 db match table (先檢查有沒有這筆 match 的資料決定 create OR update)
    })

  
    socket.on("test", msg => {
      console.log("test: ", msg);
    });

    socket.on("disconnect", () => {
      console.log("Socket: user disconnected");
    });
  });
}


function runCode() {
  // run user's code with user's test cases
  // send back result
}

module.exports = socket;
