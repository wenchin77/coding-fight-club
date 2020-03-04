const mysql = require("../util/mysql.js");
const errors = require("../util/errors");
const crypto = require("crypto");

module.exports = {
  queryInsertUser: async data => {
    try {
      console.log("inserting user...");
      // req.body eg. { username: '1234', email: '1234@com', password: '1234' }
      // check in db if username exists
      await mysql.query("START TRANSACTION");

      let usernameNo = await mysql.query(
        "SELECT COUNT (*) FROM user_table WHERE user_name = ?",
        [data.username]
      );
      if (usernameNo[0]["COUNT (*)"] > 0) {
        throw errors.usernameTakenError;
      }

      let emailNo = await mysql.query(
        "SELECT COUNT (*) FROM user_table WHERE email = ?",
        [data.email]
      );
      if (emailNo[0]["COUNT (*)"] > 0) {
        throw errors.userEmailTakenError;
      }

      let now = Date.now();
      let hash = crypto.createHash("sha256");
      hash.update(data.email + data.password + now);
      let token = hash.digest("hex");

      // encrypt password
      let passwordHash = crypto.createHash("sha256");
      passwordHash.update(data.password);
      let encryptedPassword = passwordHash.digest("hex");
      let userInfo = {
        user_name: data.username,
        user_password: encryptedPassword,
        email: data.email,
        provider: "native",
        access_expired: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        token,
        points: 0,
        level_id: 1 // beginner level id
      };

      await mysql.query("INSERT INTO user_table SET ?", userInfo);

      let getUserInfo = await mysql.query(
        "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
        [data.email]
      );
      console.log(getUserInfo);
      let result = {
        id: getUserInfo[0].id,
        username: getUserInfo[0].user_name,
        email: getUserInfo[0].email,
        provider: getUserInfo[0].provider,
        token: getUserInfo[0].token,
        points: getUserInfo[0].points,
        level: getUserInfo[0].level_name,
        access_expired: getUserInfo[0].access_expired
      };
      await mysql.query("COMMIT");
      return result;
    } catch (err) {
      await mysql.query("ROLLBACK");
      throw err;
    }
  },

  queryCountUsersByUsername: async username => {
    return mysql.query("SELECT COUNT (*) FROM user_table WHERE user_name = ?", [
      username
    ]);
  },

  queryCountUsersByEmail: async email => {
    return mysql.query("SELECT COUNT (*) FROM user_table WHERE email = ?", [
      email
    ]);
  },

  queryCountUsersByEmailPassword: async (email, password) => {
    return mysql.query(
      "SELECT COUNT (*) FROM user_table WHERE email = ? AND user_password = ?",
      [email, password]
    );
  },

  queryUpdateUser: async data => {
    return mysql.query(
      "UPDATE user_table SET token = ?, access_expired = ? WHERE email = ? LIMIT 1",
      [data.token, data.access_expired, data.email]
    );
  },

  querySelectUserByEmail: async email => {
    return mysql.query(
      "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
      [email]
    );
  },

  querySelectUserByToken: async token => {
    return mysql.query(
      "SELECT user_table.id, user_table.email, user_table.user_name, user_table.points, user_table.github_url, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.token = ?",
      [token]
    );
  },

  querySelectUserInfoByToken: async token => {
    return mysql.query("SELECT id, user_name FROM user_table WHERE token = ?", [
      token
    ]);
  },

  queryInsertBugReport: async (token, bug) => {
    return mysql.query(
      `INSERT INTO bug_report (user_id, bug) VALUES ((SELECT id FROM user_table WHERE token = ?), ?)`,
      [token, bug]
    );
  },

  querySelectNextLevelMin: async user_id => {
    return mysql.query(
      `SELECT l.level_name AS next_name, l.id AS next_id, l.min_points AS next_points, 
    u.level_id, u.points 
    FROM user_table u
    INNER JOIN level_table l ON u.level_id + 1 = l.id 
    WHERE u.id = ?`,
      [user_id]
    );
  },

  queryUpdateUserLevel: async (level_id, user_id) => {
    return mysql.query("UPDATE user_table SET level_id = ? WHERE id = ?", [
      level_id,
      user_id
    ]);
  },

  querySelectLeaderboardUsers: async () => {
    return mysql.query(`SELECT u.user_name, u.points, l.level_name, u.created_at FROM user_table u
    INNER JOIN level_table l ON u.level_id = l.id
    ORDER BY points DESC LIMIT 20`);
  }
};
