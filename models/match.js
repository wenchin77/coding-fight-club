const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertMatch: (data) => {
    return mysql.query('INSERT INTO match_table SET ?', data)
  },

  queryGetMatchQuestion: (key) => {
    return mysql.query('SELECT question_id from match_table WHERE match_key =?', [key])
  },

  queryUpdateMatch: (key, user) => {
    console.log(key, user)
    return mysql.query('UPDATE match_table SET match_start_time = CURRENT_TIMESTAMP, user_id_2 = ? WHERE match_key = ? LIMIT 1', [user, key])
  },

  queryGetMatchID: (key) => {
    return mysql.query('select id from match_table where match_key = ?', [key])
  },

  queryInsertMatchDetail: (match_id, question_id, user_id) => {
    return mysql.query('INSERT INTO match_detail SET match_id = ?, question_id = ?, user_id = ?', [match_id, question_id, user_id])
  },

}