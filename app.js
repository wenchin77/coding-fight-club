const express = require('express');
const app = express();
const router = express.Router();

app.use(express.static('public'));
// const cst=require("./util/constants.js");
const bodyparser=require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));


app.get('/', function (req, res) {
  res.send('Hello World!');
});

// match page
app.get('/match', function(req, res){
  res.sendFile(__dirname + '/public/match.html');
});

// socket io settings for live demo
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('Socket: a user connected');
  socket.on('disconnect', () => {
    console.log('Socket: user disconnected');
  });
});


io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    console.log(msg);
  });
});


http.listen(3000, function () {
  console.log('App running on port 3000!');
});

module.exports = router;