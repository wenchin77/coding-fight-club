const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertMatch: (data) => {
    return mysql.query('INSERT INTO match_table SET ?', data)
  },

  queryGetMatchQuestion: (key) => {
    return mysql.query('SELECT question_id from match_table WHERE match_key =?', [key])
  },

  queryUpdateMatch: (key, user) => {
    return mysql.query('UPDATE match_table SET match_start_time = CURRENT_TIMESTAMP, user_id_2 = ? WHERE match_key = ? LIMIT 1', [user, key])
  },

  queryGetMatchID: (key) => {
    return mysql.query('SELECT id FROM match_table WHERE match_key = ?', [key])
  },

  queryInsertMatchDetail: (match_id, question_id, user_id) => {
    return mysql.query('INSERT INTO match_detail SET match_id = ?, question_id = ?, user_id = ?', [match_id, question_id, user_id])
  },

  queryGetMatchStartTime: (key) => {
    return mysql.query('SELECT match_start_time FROM match_table WHERE match_key = ?', [key])
  },

  queryCountMatchDetailRows: (match_id, user_id) => {
    return mysql.query('SELECT COUNT (*) FROM match_detail WHERE match_id = ? AND user_id = ?', [match_id, user_id])
  },

  queryUpdateMatchDetail: (match_id, user, code, correctness, exec_time, answer_time) => {
    return mysql.query('UPDATE match_detail SET answer_code = ?, correctness = ?, exec_time = ?, answer_time = ? WHERE match_id = ? AND user_id = ? LIMIT 1', [code, correctness, exec_time, answer_time, match_id, user])
  },

  queryGetSubmitNumber: (match_id) => {
    return mysql.query('SELECT COUNT (*) FROM match_detail WHERE match_id = ? AND answer_code IS NOT NULL', [match_id])
  },

  queryGetMatchDetailPastExecTime: (question_id) => {
    return mysql.query('SELECT exec_time FROM match_detail WHERE question_id = ? AND exec_time IS NOT NULL ORDER BY exec_time ASC', [question_id])
  }

}