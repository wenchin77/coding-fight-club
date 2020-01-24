// socket.io setup for live demo
const socketio = require('socket.io');
const socket = {};

socket.init = (server) => {
  const io = socketio.listen(server);
  io.on("connection", socket => {
    console.log("Socket: a user connected");

    // 接收
    socket.on("codeObject", obj => {
      console.log("codeObject", obj);
      // 回傳
      io.emit("codeResult", "I am your codeResult");
    });

  
    socket.on("test", msg => {
      console.log("test: ", msg);
    });
  
    socket.on("disconnect", () => {
      console.log("Socket: user disconnected");
    });
  });
}

module.exports = socket;