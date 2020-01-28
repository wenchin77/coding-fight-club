const mysql = require("../util/mysql.js");

const queryInsertQuestion = question => {
  return new Promise((resolve, reject) => {
    mysql.con.query(
      'INSERT INTO question SET ?',
      question,
      (err, rows, fields) => {
        console.log(rows);
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

module.exports = { queryInsertQuestion };