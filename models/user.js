const mysql = require("../util/mysql.js");
const errors = require("../util/errors");
const crypto = require("crypto");
// request: to get google profile
const request = require("request");

module.exports = {
  querySignUp: async data => {
    try {
      console.log("at querySignUp...");
      // data eg. { username: '1234', email: '1234@com', password: '1234' }
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
      console.log('ROLLBACK at querySignUp');
      console.log(err);
      throw err;
    }
  },

  querySignIn: async data => {
    try {
      console.log("at querySignIn...");
      // data eg. { provider: 'native', email: '1234@com', password: '1234' }
      await mysql.query("START TRANSACTION");

      // native
      if (data.provider === "native") {
        let emailNo = await mysql.query(
          "SELECT COUNT (*) FROM user_table WHERE email = ?",
          [data.email]
        );
        if (emailNo[0]["COUNT (*)"] === 0) {
          throw errors.userEmailNotSignedUp;
        }

        let passwordHash = crypto.createHash("sha256");
        passwordHash.update(data.password);
        let encryptedPassword = passwordHash.digest("hex");
        let passwordCheck = await mysql.query(
          "SELECT COUNT (*) FROM user_table WHERE email = ? AND user_password = ?",
          [data.email, encryptedPassword]
        );
        if (passwordCheck[0]["COUNT (*)"] === 0) {
          throw errors.userWrongPassword;
        }

        // check if token's not expired, if not send back the same token, if so set a new token
        let now = Date.now();
        let getUserInfo = await mysql.query(
          "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
          [data.email]
        );
        let accessExpired = getUserInfo[0].access_expired;
        if (now <= accessExpired) {
          let userInfo = {
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
          return userInfo;
        }
        // token expired: set a new token and send back to frontend
        let hash = crypto.createHash("sha256");
        hash.update(data.email + data.password + now);
        let token = hash.digest("hex");
        let newAccessExpiredTime = now + 30 * 24 * 60 * 60 * 1000; // 30 days

        console.log("updating user...");
        await mysql.query(
          "UPDATE user_table SET token = ?, access_expired = ? WHERE email = ? LIMIT 1",
          [token, newAccessExpiredTime, data.email]
        );

        let updatedUserInfo = await mysql.query(
          "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
          [data.email]
        );
        let result = {
          id: updatedUserInfo[0].id,
          username: updatedUserInfo[0].user_name,
          email: updatedUserInfo[0].email,
          provider: updatedUserInfo[0].provider,
          token: updatedUserInfo[0].token,
          points: updatedUserInfo[0].points,
          level: updatedUserInfo[0].level,
          access_expired: updatedUserInfo[0].access_expired
        };
        await mysql.query("COMMIT");
        return result;
      };

      // google
      if (data.provider === "google") {
        console.log("getting ajax for google signin...");
        // Get profile from google
        let profile = await getGoogleProfile(data.access_token);
        if (!profile.name || !profile.email) {
          throw errors.googleNameOrEmailNotFound;
        }

        // check in db if email exists
        let emailNo = await mysql.query(
          "SELECT COUNT (*) FROM user_table WHERE email = ?",
          [profile.email]
        );
        if (emailNo[0]["COUNT (*)"] === 0) {
          console.log("google user not found, inserting...");
          let now = Date.now();
          let hash = crypto.createHash("sha256");
          hash.update(profile.email + now);
          let token = hash.digest("hex");
          let userInfo = {
            user_name: profile.name,
            email: profile.email,
            picture: profile.picture,
            provider: data.provider,
            access_expired: now + 30 * 24 * 60 * 60 * 1000, // 30 days
            token,
            points: 0,
            level_id: 1 // beginner level id
          };
          console.log("inserting user...");
          await mysql.query("INSERT INTO user_table SET ?", userInfo);
          let getUserInfo = await mysql.query(
            "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
            [profile.email]
          );
          console.log(getUserInfo);
          let result = {
            id: getUserInfo[0].id,
            username: getUserInfo[0].user_name,
            email: getUserInfo[0].email,
            picture: getUserInfo[0].picture,
            provider: getUserInfo[0].provider,
            token: getUserInfo[0].token,
            points: getUserInfo[0].points,
            level: getUserInfo[0].level_name,
            access_expired: getUserInfo[0].access_expired
          };
          await mysql.query("COMMIT");
          return result;
        }

        // check if token's not expired, if not send back the same token, if so set a new token
        console.log("google user found, updating...");
        let now = Date.now();
        let getUserInfo = await mysql.query(
          "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
          [profile.email]
        );
        let accessExpired = getUserInfo[0].access_expired;
        if (now <= accessExpired) {
          let userInfo = {
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
          return userInfo;
        }
        // token expired: set a new token and send back to frontend
        let hash = crypto.createHash("sha256");
        hash.update(profile.email + now);
        let token = hash.digest("hex");
        let newAccessExpiredTime = now + 30 * 24 * 60 * 60 * 1000; // 30 days

        console.log("updating user...");
        await mysql.query(
          "UPDATE user_table SET token = ?, access_expired = ? WHERE email = ? LIMIT 1",
          [token, newAccessExpiredTime, profile.email]
        );

        let updatedUserInfo = await mysql.query(
          "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
          [profile.email]
        );
        let result = {
          id: updatedUserInfo[0].id,
          username: updatedUserInfo[0].user_name,
          email: updatedUserInfo[0].email,
          provider: updatedUserInfo[0].provider,
          token: updatedUserInfo[0].token,
          points: updatedUserInfo[0].points,
          level: updatedUserInfo[0].level,
          access_expired: updatedUserInfo[0].access_expired
        };
        await mysql.query("COMMIT");
        return result;
      };

      // github
      if (data.provider === "github") {
        console.log("getting ajax for github signin...", data);
        // eg. data = {
        //   provider: "github",
        //   name: user.data.login,
        //   email: primaryEmail,
        //   picture: user.data.avatar_url,
        //   github_url: user.data.html_url
        // };
        if (!data.name || !data.email) {
          throw errors.githubNameOrEmailNotFound;
        }

        // check in db if email exists
        let emailNo = await mysql.query(
          "SELECT COUNT (*) FROM user_table WHERE email = ?",
          [data.email]
        );
        if (emailNo[0]["COUNT (*)"] === 0) {
          console.log("github user not found, inserting...");
          // if not insert user
          let now = Date.now();
          let hash = crypto.createHash("sha256");
          hash.update(data.email + now);
          let token = hash.digest("hex");

          let userInfo = {
            user_name: data.name,
            email: data.email,
            picture: data.picture,
            provider: data.provider,
            github_url: data.github_url,
            access_expired: now + 30 * 24 * 60 * 60 * 1000, // 30 days
            token,
            points: 0,
            level_id: 1 // beginner level id
          };
          console.log("inserting user...");
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
            picture: getUserInfo[0].picture,
            provider: getUserInfo[0].provider,
            github_url: getUserInfo[0].github_url,
            token: getUserInfo[0].token,
            points: getUserInfo[0].points,
            level: getUserInfo[0].level_name,
            access_expired: getUserInfo[0].access_expired
          };
          await mysql.query("COMMIT");
          return result;
        }

        // check if token's not expired, if not send back the same token, if so set a new token
        console.log("github user found, updating...");
        let now = Date.now();
        let getUserInfo = await mysql.query(
          "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
          [data.email]
        );
        let accessExpired = getUserInfo[0].access_expired;
        if (now <= accessExpired) {
          let userInfo = {
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
          return userInfo;
        }
        // token expired: set a new token and send back to frontend
        let hash = crypto.createHash("sha256");
        hash.update(data.email + now);
        let token = hash.digest("hex");
        let newAccessExpiredTime = now + 30 * 24 * 60 * 60 * 1000; // 30 days

        console.log("updating user...");
        await mysql.query(
          "UPDATE user_table SET token = ?, access_expired = ? WHERE email = ? LIMIT 1",
          [token, newAccessExpiredTime, data.email]
        );

        let updatedUserInfo = await mysql.query(
          "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
          [data.email]
        );
        let result = {
          id: updatedUserInfo[0].id,
          username: updatedUserInfo[0].user_name,
          email: updatedUserInfo[0].email,
          provider: updatedUserInfo[0].provider,
          token: updatedUserInfo[0].token,
          points: updatedUserInfo[0].points,
          level: updatedUserInfo[0].level,
          access_expired: updatedUserInfo[0].access_expired
        };
        await mysql.query("COMMIT");
        return result;
      };
    } catch (err) {
      await mysql.query("ROLLBACK");
      console.log('ROLLBACK at querySignIn');
      console.log(err);
      throw err;
    }
  },

  // querySelectUserByEmail: async email => {
  //   return mysql.query(
  //     "SELECT user_table.*, level_table.level_name FROM user_table INNER JOIN level_table ON user_table.level_id = level_table.id WHERE user_table.email = ?",
  //     [email]
  //   );
  // },

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
    return await mysql.query(`SELECT u.user_name, u.points, l.level_name, u.created_at FROM user_table u
    INNER JOIN level_table l ON u.level_id = l.id
    ORDER BY points DESC LIMIT 20`);
  }
};

function getGoogleProfile(accessToken) {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      resolve(null);
      return;
    }
    let url = `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`;
    request(url, (error, res, body) => {
      if (error) {
        console.log(error);
      }
      console.log(body);
      body = JSON.parse(body);
      if (body.error) {
        reject(body.error);
      } else {
        resolve(body);
      }
    });
  });
}
