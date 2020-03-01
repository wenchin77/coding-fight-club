const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertUser: (data) => {
    let result = mysql.query('INSERT INTO user_table SET ?', data);
    return result;
  },

  queryCountUsersByUsername: (username) => {
    return mysql.query('SELECT COUNT (*) FROM user_table WHERE user_name = ?', [username])
  },

  queryCountUsersByEmail: (email) => {
    return mysql.query('SELECT COUNT (*) FROM user_table WHERE email = ?', [email])
  },

  queryCountUsersByEmailPassword: (email, password) => {
    return mysql.query('SELECT COUNT (*) FROM user_table WHERE email = ? AND user_password = ?', [email, password])
  },

  queryUpdateUser: (data) => {
    return mysql.query('UPDATE user_table SET token = ?, access_expired = ? WHERE email = ? LIMIT 1', [data.token, data.access_expired, data.email])
  },

  querySelectUserByEmail: (email) => {
    return mysql.query('SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?', [email]);
  },

  querySelectUserByToken: (token) => {
    return mysql.query('SELECT user_table.id, user_table.email, user_table.user_name, user_table.points, user_table.github_url, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.token = ?', [token]);
  },

  querySelectUserInfoByToken: (token) => {
    return mysql.query('SELECT id, user_name FROM user_table WHERE token = ?', [token]);
  },

  queryInsertBugReport: (token, bug) => {
    return mysql.query(`INSERT INTO bug_report (user_id, bug) VALUES ((SELECT id FROM user_table WHERE token = ?), ?)`, [token, bug]);
  },

  querySelectNextLevelMin: (user_id) => {
    return mysql.query(`SELECT l.level_name AS next_name, l.id AS next_id, l.min_points AS next_points, 
    u.level_id, u.points 
    FROM user_table u
    INNER JOIN level_table l ON u.level_id + 1 = l.id 
    WHERE u.id = ?`, [user_id])
  },

  queryUpdateUserLevel: (level_id, user_id) => {
    return mysql.query('UPDATE user_table SET level_id = ? WHERE id = ?', [level_id, user_id])
  },

  querySelectLeaderboardUsers: () => {
    return mysql.query(`SELECT u.user_name, u.points, l.level_name, u.created_at FROM user_table u
    INNER JOIN level_table l ON u.level_id = l.id
    ORDER BY points DESC LIMIT 20`)
  }

}