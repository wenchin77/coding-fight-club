// const AppError = require('../util/appError');
// sql 語句拆到 model/user 去
const userModel = require('../models/user');
const crypto = require("crypto");


module.exports = {
  insertUser: async (data) => {
    // generate token and pass it to db & frontend
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
        token
      }
      console.log('inserting user...')
      let result = await userModel.queryInsertUser(userInfo);
      let id = result.insertId;
      return({
        id,
        username: data.username,
        email: data.email,
        provider: 'native',
        token
      });
    } catch (err) {
      console.log(err);
    }
  },

  updateUser: async (data) => {
    // generate token and pass it to db & frontend
    let now = Date.now();
    let hash = crypto.createHash("sha256");
    hash.update(data.email + data.password + now);
    let token = hash.digest("hex");
    
    try  {
      let userInfo = {
        email: data.email,
        password: data.password,
        access_expired: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        token
      }
      console.log('updating user...')
      await userModel.queryUpdateUser(userInfo);
      let getUserInfo = await userModel.querySelectUser(data.email);
      console.log('getUserInfo result',getUserInfo[0])
      return({
        id: getUserInfo[0].id,
        username: getUserInfo[0].user_name,
        email: data.email,
        provider: 'native',
        token
      });
    } catch (err) {
      console.log(err);
    }
  },

  countUsersByEmail: async (email) => {
    console.log('countUsersByEmail email', email)
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

  

}