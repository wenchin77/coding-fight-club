const mysql = require("../util/mysql.js");

function queryInsertQuestion(question) {
  return mysql.con.query('INSERT INTO question SET ?', question);
};

function queryInsertTest(test) {
  return mysql.con.query('INSERT INTO test SET ?', test);
}

function querySelectAllQuestion() {
  return mysql.con.query('SELECT * FROM question');
}


module.exports = { 
  queryInsertQuestion,
  queryInsertTest,
  querySelectAllQuestion
};