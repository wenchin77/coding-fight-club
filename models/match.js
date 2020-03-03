const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertMatch: (data) => {
    return mysql.query('INSERT INTO match_table SET ?', data)
  },

  queryGetMatchQuestion: (key) => {
    return mysql.query('SELECT question_id from match_table WHERE match_key = ?', [key])
  },

  queryUpdateMatch: (key) => {
    let now = Date.now();
    return mysql.query('UPDATE match_table SET match_start_time = ? WHERE match_key = ? LIMIT 1', [now, key])
  },

  queryGetMatchID: (key) => {
    return mysql.query('SELECT id FROM match_table WHERE match_key = ?', [key])
  },

  queryInsertMatchDetail: (match_id, user_id) => {
    return mysql.query('INSERT INTO match_detail SET match_id = ?, user_id = ?', [match_id, user_id])
  },

  queryGetMatchStartTime: (key) => {
    return mysql.query('SELECT match_start_time FROM match_table WHERE match_key = ?', [key])
  },

  queryCountMatchDetailRows: (match_id, user_id) => {
    return mysql.query('SELECT COUNT (*) FROM match_detail WHERE match_id = ? AND user_id = ?', [match_id, user_id])
  },
  queryUpdateMatchDetail: (match_id, user_id, data) => {
    return mysql.query('UPDATE match_detail SET ? WHERE match_id = ? AND user_id = ? LIMIT 1', [data, match_id, user_id])
  },

  queryGetMatchDetailPastExecTime: (question_id) => {
    return mysql.query('SELECT large_exec_time FROM question INNER JOIN match_table ON question.id = match_table.question_id INNER JOIN match_detail ON match_table.id = match_detail.match_id WHERE question.id = ? AND large_exec_time IS NOT NULL ORDER BY large_exec_time ASC', [question_id])
  },

  queryUpdateMatchWinner: (key, winner) => {
    return mysql.query('UPDATE match_table SET winner_user_id = ? WHERE match_key = ? LIMIT 1', [winner, key])
  },

  queryGetMatchDetails: (match_id) => {
    return mysql.query('SELECT match_table.question_id, match_table.winner_user_id, match_table.match_start_time, match_table.updated_at, match_detail.* FROM match_table INNER JOIN match_detail ON match_table.id = match_detail.match_id WHERE match_table.id = ?', [match_id])
  }

}