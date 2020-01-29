const mysql = require("../util/mysql.js");

function queryInsertQuestion(question) {
  return mysql.query('INSERT INTO question SET ?', question);
};

const queryInsertTest = test => {
  return new Promise((resolve, reject) => {
    mysql.con.query(
      'INSERT INTO test SET ?',
      test,
      (err, rows, fields) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

const querySelectAllQuestion = () => {
  return new Promise((resolve, reject) => {
    mysql.con.query(
      'SELECT * FROM question',
      (err, rows, fields) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

module.exports = {
  queryInsertQuestion,
  queryInsertTest,
  querySelectAllQuestion
};
