// const AppError = require('../util/appError');
// sql 語句拆到 model/user 去
const userModel = require('../models/user');
const crypto = require("crypto");


module.exports = {
  insertUser: async (data) => {
    let now = Date.now();
    let hash = crypto.createHash("sha256");
    hash.update(data.email + data.password + now);
    let token = hash.digest("hex");

    // encrypt password
    let passwordHash = crypto.createHash("sha256");
    passwordHash.update(data.password);
    let encryptedPassword = passwordHash.digest("hex");
    
    try  {
      let userInfo = {
        user_name: data.username,
        user_password: encryptedPassword,
        email: data.email,
        provider: 'native',
        access_expired: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        token,
        points: 0
      }
      console.log('inserting user...')
      let result = await userModel.queryInsertUser(userInfo);
      let id = result.insertId;
      return({
        id: getUserInfo[0].id,
        username: getUserInfo[0].user_name,
        email: getUserInfo[0].email,
        provider: getUserInfo[0].provider,
        token: getUserInfo[0].token,
        points: getUserInfo[0].points,
        level: getUserInfo[0].level,
        access_expired: getUserInfo[0].access_expired
      });
    } catch (err) {
      console.log(err);
    }
  },

  updateUser: async (data) => {
    // check if token's not expired, if not send back the same token
    let now = Date.now();
    let getUserInfo = await userModel.querySelectUser(data.email);
    let accessExpired = getUserInfo[0].access_expired;
    if (now <= accessExpired) {
      return({
        id: getUserInfo[0].id,
        username: getUserInfo[0].user_name,
        email: getUserInfo[0].email,
        provider: getUserInfo[0].provider,
        token: getUserInfo[0].token,
        points: getUserInfo[0].points,
        level: getUserInfo[0].level,
        access_expired: getUserInfo[0].access_expired
      });
    };

    // token expired: set a new token and send back to frontend
    let hash = crypto.createHash("sha256");
    hash.update(data.email + data.password + now);
    let token = hash.digest("hex");
    
    if (data.provider === 'native') {
      try  {
        let userInfo = {
          access_expired: now + 30 * 24 * 60 * 60 * 1000, // 30 days
          token
        }
        console.log('updating user...')
        await userModel.queryUpdateUser(userInfo);
        let getUserInfo = await userModel.querySelectUser(data.email);
        return({
          id: getUserInfo[0].id,
          username: getUserInfo[0].user_name,
          email: getUserInfo[0].email,
          provider: getUserInfo[0].provider,
          token: getUserInfo[0].token,
          points: getUserInfo[0].points,
          level: getUserInfo[0].level,
          access_expired: getUserInfo[0].access_expired
        });
      } catch (err) {
        console.log(err);
      }
    }
  },
  

  countUsersByEmail: async (email) => {
    try {
      let emailNumObj = await userModel.queryCountUsersByEmail(email);
      return(emailNumObj[0]['COUNT (*)']);
    } catch (err) {
      console.log(err);
    }
  },

  countUsersByUserName: async (username) => {
    try {
      let emailNumObj = await userModel.queryCountUsersByUsername(username);
      return(emailNumObj[0]['COUNT (*)']);
    } catch (err) {
      console.log(err);
    }
  },

  countPasswordEmailMatch: async (email, password) => {
    // encrypt password
    let passwordHash = crypto.createHash("sha256");
    passwordHash.update(password);
    let encryptedPassword = passwordHash.digest("hex");
    try {
      let rowNumObj = await userModel.queryCountUsersByEmailPassword(email, encryptedPassword);
      return(rowNumObj[0]['COUNT (*)']);
    } catch (err) {
      console.log(err);
    }
  },

  selectUserInfoByToken: async (token) => {
    try {
      let result = await userModel.querySelectUserInfoByToken(token);
      return(result);
    } catch (err) {
      console.log(err);
    }
  },

  insertBugReport: async (reporter, content) => {
    try {
      await userModel.queryInsertBugReport({reporter, content});
    } catch (err) {
      console.log(err);
    }
  },

  

}