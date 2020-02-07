const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertMatch: (data) => {
    return mysql.query('INSERT INTO match_table SET ?', data)
  },

  queryGetMatchQuestion: (key) => {
    return mysql.query('SELECT question_id from match_table WHERE match_key =?', [key])
  }
}