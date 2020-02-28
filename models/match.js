const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertMatch: (data) => {
    return mysql.query('INSERT INTO match_table SET ?', data)
  },

  queryGetMatchQuestion: (key) => {
    return mysql.query('SELECT question_id from match_table WHERE match_key = ?', [key])
  },

  queryUpdateMatch: (key, data) => {
    return mysql.query('UPDATE match_table SET ? WHERE match_key = ? LIMIT 1', [data, key])
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
    return mysql.query('UPDATE match_detail SET ? WHERE match_id = ? AND user_id = ? LIMIT 1', [data, match_id, user_id]);
  },

  queryAddUserPoints: (user_id, points) => {
    return mysql.query('UPDATE user_table SET points = points + ? WHERE id = ?', [points, user_id]);
  },

  queryGetMatchDetailPastExecTime: (question_id) => {
    return mysql.query('SELECT large_exec_time FROM question INNER JOIN match_table ON question.id = match_table.question_id INNER JOIN match_detail ON match_table.id = match_detail.match_id WHERE question.id = ? AND large_exec_time IS NOT NULL ORDER BY large_exec_time ASC', [question_id])
  },

  queryUpdateMatchWinner: (key, winner, status) => {
    return mysql.query('UPDATE match_table SET winner_user_id = ?, match_status = ? WHERE match_key = ? LIMIT 1', [winner, status, key])
  },

  queryGetMatchDetails: (match_id) => {
    return mysql.query(`SELECT match_table.question_id, match_table.id, match_table.match_start_time,
    match_table.updated_at, match_table.winner_user_id, match_detail.*, user_table.user_name
    FROM match_table INNER JOIN match_detail ON match_table.id = match_detail.match_id 
    INNER JOIN user_table ON match_detail.user_id = user_table.id
    WHERE match_table.id = ?`, [match_id])
  },

  queryGetMatchSummary: (user_id) => {
    return mysql.query(`SELECT u.id AS userid, md.points, md.match_id, u.user_name, m.match_key, m.winner_user_id, m.match_start_time, q.question_name, q.category, q.difficulty
    FROM match_detail md
    INNER JOIN user_table u ON md.user_id = u.id
    INNER JOIN match_table m ON m.id = md.match_id
    INNER JOIN question q ON q.id = m.question_id
    WHERE md.match_id IN (SELECT match_id FROM match_detail WHERE user_id = ?) AND m.match_status = 1
    ORDER BY match_start_time DESC LIMIT 10`, [user_id])
  },

  queryGetMatchHistory: (user_id) => {
    return mysql.query(`SELECT u.id AS userid, md.points, md.match_id, u.user_name, m.match_key, m.winner_user_id, m.match_start_time, q.question_name, q.category, q.difficulty
    FROM match_detail md
    INNER JOIN user_table u ON md.user_id = u.id
    INNER JOIN match_table m ON m.id = md.match_id
    INNER JOIN question q ON q.id = m.question_id
    WHERE md.match_id IN (SELECT match_id FROM match_detail WHERE user_id = ?) AND m.match_status = 1
    ORDER BY match_start_time DESC`, [user_id])
  },

  queryGetMatchStatus: (key) => {
    return mysql.query(`SELECT match_status FROM match_table WHERE match_key = ? LIMIT 1`, [key])
  },

  queryUpdateMatchStatus: (key, status) => {
    return mysql.query('UPDATE match_table SET match_status = ? WHERE match_key = ? LIMIT 1', [status, key])
  }

}