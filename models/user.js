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

  querySelectUser: (email) => {
    return mysql.query('SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?', [email]);
  },

  querySelectUserInfoByToken: (token) => {
    return mysql.query('SELECT id, user_name FROM user_table WHERE token = ?', [token]);
  },

  queryInsertBugReport: (data) => {
    return mysql.query('INSERT INTO bug_report SET ?', data);
  },

  querySelectNextLevelMin: (user_id) => {
    return mysql.query('SELECT level_table.*, user_table.level_id, user_table.points FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.id = ?', [user_id])
  },

  queryUpdateUserLevel: (level_id, user_id) => {
    return mysql.query('UPDATE user_table SET level_id = ? WHERE id = ?', [level_id, user_id])
  }

}