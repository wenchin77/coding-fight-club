const express = require('express');
const app = express();
const cors = require('cors');
const AppError = require('./util/appError.js');
const socket = require('./socket');


app.use(express.static('public'));
// const cst=require("./util/constants.js");
const bodyparser=require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

// Allow Cross-Origin requests
app.use(cors());



app.get('/', (req, res) => {
  res.send('Hello World!');
});


// match page
app.get('/match', (req, res) => {
  res.sendFile(__dirname + "/views/match.html");
});



// Routes
// app.use('/api/v1/user', userRoutes);

// handle undefined Routes
app.use('*', (req, res, next) => {
  const err = new AppError(404, 'fail', 'undefined route');
  next(err, req, res, next);
});


const server = app.listen(3000, () => {
  console.log('App running on port 3000!');
});

socket.init(server);