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
  },

  querySelectQuestion: (question_id) => {
    return mysql.query('SELECT * FROM question WHERE id = ?', [question_id]);
  },

  querySelectSampleTestCases: (question_id) => {
    return mysql.query('SELECT test_data, test_result FROM test WHERE question_id = ?', [question_id]);
  }

}