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

  querySelectSampleTestCases: (question_id, is_large_case) => {
    return mysql.query('SELECT test_case_path, test_result FROM test WHERE question_id = ? AND is_large_case = ?', [question_id, is_large_case]);
  },

  querySelectThresholdMs: (question_id, is_large_file) => {
    return mysql.query('SELECT threshold_ms FROM test WHERE question_id = ? AND is_large_case = 1', [question_id]);
  }

}