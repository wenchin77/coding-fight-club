// socket.io setup for live demo

const socket = {};

socket.init = (server) => {
    const io = require('socket.io').listen(server);
    io.on("connection", socket => {
      console.log("Socket: a user connected");
      socket.on("code", msg => {
        console.log("code", msg);
        // 回傳：伺服器跑用戶輸入程式碼 ＋ test case 裡面的東西的結果
        io.emit("codeResult", "I am codeResult");
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