const mysql = require("../util/mysql.js");

function queryInsertQuestion(question) {
  return mysql.query('INSERT INTO question SET ?', question);
};

function queryInsertTest(test) {
  return mysql.query('INSERT INTO test SET ?', test);
}

function querySelectAllQuestion() {
  return mysql.query('SELECT * FROM question');
}


module.exports = { 
  queryInsertQuestion,
  queryInsertTest,
  querySelectAllQuestion
};