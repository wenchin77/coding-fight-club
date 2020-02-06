const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertQuestion: (question) => {
    return mysql.query('INSERT INTO question SET ?', question);
  },
  
  queryInsertTest: (test) => {
    return mysql.query('INSERT INTO test SET ?', test);
  },
  
  querySelectAllQuestions: (difficulty) => {
    return mysql.query('SELECT id, question_name, difficulty, category FROM question WHERE difficulty = ?;', [difficulty]);
  },

  querySelectQuestions: (category, difficulty) => {
    return mysql.query('SELECT id, question_name, difficulty, category FROM question WHERE category = ? AND difficulty = ?;', [category, difficulty]);
  }
}