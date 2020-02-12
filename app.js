const express = require('express');
const app = express();
const cors = require('cors');
const AppError = require('./util/appError.js');
const socket = require('./socket');
const path = require('path');

const matchRoutes = require('./routes/matchRoutes');
const questionRoutes = require('./routes/questionRoutes');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
// const cst=require("./util/constants.js");
const bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// allow cross-origin requests
app.use(cors());

app.get('/', (req, res) => {
  res.render('index');
});

// match pages
app.get('/match_setup', (req, res) => {
  res.render('match_setup');
});

app.get('/match/:matchKey', (req, res) => {
  res.render('match');
});

app.get('/match_result/:matchKey', (req, res) => {
  res.render('match_result');
});


// user pages
app.get('/signin', (req, res) => {
  res.render('signin');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

// bug report
app.get('/bug_report', (req, res) => {
  res.render('bug_report');
});

// api routes
app.use('/api/v1/match', matchRoutes);
app.use('/api/v1/question', questionRoutes);


// handle undefined routes
app.use('*', (req, res, next) => {
  const err = new AppError(404, 'fail', 'undefined route');
  next(err, req, res, next);
});

const server = app.listen(3000, () => {
  console.log('App running on port 3000!');
});

socket.init(server);
