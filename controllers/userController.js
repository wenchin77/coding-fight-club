// const AppError = require('../util/appError');
// sql 語句拆到 model/user 去
const userModel = require("../models/user");
const errors = require("../util/errors");
const crypto = require("crypto");

module.exports = {
  signup: () => {
    return async (req, res) => {
      try {
        let data = req.body;
        let result = await userModel.querySignUp(data);
        res.status(200).send(result);
      } catch (err) {
        if (err.statusCode) {
          res.status(err.statusCode).send(err.message);
          return;
        }
        res.status(errors.serverError.statusCode).send(errors.serverError.message);
      }
    };
  },

  signin: () => {
    return async (req, res) => {
      let data = req.body;
      console.log(data)
      // req.body eg. { email: '1234@com', password: '1234' }
      if (data.password) {
        data.provider = 'native';
      }
      try{
        let result = await userModel.querySignIn(data);
        res.status(200).send(result);
      } catch (err) {
        if (err.statusCode) {
          res.status(err.statusCode).send(err.message);
          return;
        }
        res.status(errors.serverError.statusCode).send(errors.serverError.message);
      }
    }
  },

  selectUserByToken: async token => {
    try {
      let result = await userModel.querySelectUserByToken(token);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  insertBugReport: async (token, bug) => {
    return await userModel.queryInsertBugReport(token, bug);
  },

  updateUserPointsLevel: async user_id => {
    try {
      // check next level's min points
      let checkNextLevelMin = await userModel.querySelectNextLevelMin(user_id);
      let userTotalPoionts = checkNextLevelMin[0].points;
      let nextLevelMin = checkNextLevelMin[0].next_points;
      let nextLevelId = checkNextLevelMin[0].next_id;

      // if user points > next level's min points, update level id too
      if (userTotalPoionts >= nextLevelMin) {
        console.log("level up! userTotalPoionts >= nextLevelMin");
        let level = nextLevelId;
        let result = await userModel.queryUpdateUserLevel(level, user_id);
      }
    } catch (err) {
      console.log(err);
    }
  },

  getLeaderboard: () => {
    return async (req, res) => {
      try {
        let result = await userModel.querySelectLeaderboardUsers();
        res.status(200).json(result);
      } catch (err) {
        console.log(err)
        res.status(errors.serverError.statusCode).send(errors.serverError.message);
      };
    };
  },

  getUserInfo: async (token, onlineUsers, tokenIdMapping) => {
    let user;
    let username;
    let userObj;
    try {
      if (!tokenIdMapping.has(token)) {
        console.log("Cannot find user at tokenIdMapping, selecting from db...");
        let result = await userModel.querySelectUserInfoByToken(token);
        user = result[0].id;
        username = result[0].user_name;
        userObj = {
          username,
          time: Date.now(),
          inviting: 0,
          invitation_accepted: 0,
          invited: []
        };
        console.log(user, username);
        console.log("inserting onlineUsers...");
        onlineUsers.set(user, userObj);
        console.log("inserting tokenIdMapping...");
        tokenIdMapping.set(token, user);
        console.log("onlineUsers", onlineUsers);
        console.log("onlineUsers size", onlineUsers.size);
        return { user, username };
      }
      console.log("Found user at tokenIdMapping");
      user = tokenIdMapping.get(token);
      username = onlineUsers.get(user).username;
      return { user, username };
    } catch (err) {
      console.log(err);
    }
  }
};
