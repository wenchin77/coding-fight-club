const express = require('express');
const app = express();
const cors = require('cors');
const errors = require('./util/errors.js');
const socket = require('./socket');
const path = require('path');
const bodyparser = require("body-parser");
const cst = require("./util/constants.js");

const matchRoutes = require('./routes/matchRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// allow cross-origin requests
app.use(cors());

// api routes
app.use(`/api/${cst.API_VERSION}/match`, matchRoutes);
app.use(`/api/${cst.API_VERSION}/question`, questionRoutes);
app.use(`/api/${cst.API_VERSION}/user`, userRoutes);

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

app.get('/match_history', (req, res) => {
  res.render('match_history');
});

// user pages
app.get('/signin', (req, res) => {
  res.render('signin');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/leaderboard', (req, res) => {
  res.render('leaderboard');
});

// about pages
app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/terms', (req, res) => {
  res.render('terms');
});

app.get('/bug_report', (req, res) => {
  res.render('bug_report');
});

// handle undefined routes
app.use('*', (req, res, next) => {
  console.log('originalUrl: ', req.originalUrl);
  res.render('error');
  throw errors.undefinedRouteError;
});

if (require.main === module) {
  const server = app.listen(3000, () => {
    console.log('App running on port 3000...');
  });
  socket.init(server);
};

module.exports = app;
