const express = require('express');
const app = express();
const cors = require('cors');
const AppError = require('./util/appError.js');
const socket = require('./socket');
const path = require('path');
// const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
// const cst=require("./util/constants.js");
const bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Allow Cross-Origin requests
app.use(cors());

app.get('/', (req, res) => {
  res.render('index');
});


// app.get('/match', (req, res) => {
//   res.render('match');
// });

// room page
app.get('/match/:roomID', (req, res) => {
  // let roomID = req.params.roomID;
  // res.render('match', {
  //   roomID: roomID
  // });
  res.render('match');
});


app.get('/match_setup', (req, res) => {
  res.render('match_setup');
});

app.get('/signin', (req, res) => {
  res.render('signin');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

// Routes
// app.use('/api/v1/user', userRoutes);
app.use('/api/v1/question', questionRoutes);


// handle undefined Routes
app.use('*', (req, res, next) => {
  const err = new AppError(404, 'fail', 'undefined route');
  next(err, req, res, next);
});

const server = app.listen(3000, () => {
  console.log('App running on port 3000!');
});

socket.init(server);
