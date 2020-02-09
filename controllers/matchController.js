const cryptoRandomString = require('crypto-random-string');
const matchModel = require('../models/match');

module.exports = {
  
  insertMatch: async (user_id_1, question_id, match_key) => {
    // generate a random no as match key to put in url
    let data = {
      user_id_1,
      question_id,
      match_key
    }
    try {
      let result = await matchModel.queryInsertMatch(data);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  updateMatch: async (key, user) => {
    try {
      // can combine these two qeuries???
      let result = await matchModel.queryUpdateMatch(key, user);
      let getMatchID = await matchModel.queryGetMatchID(key);
      return getMatchID[0].id;
    } catch (err) {
      console.log(err);
    }
  },

  getMatchId: async (key) => {
    try {
      let getMatchID = await matchModel.queryGetMatchID(key);
      return getMatchID[0].id;
    } catch (err) {
      console.log(err);
    }
  },

  getKey: () => {
    let key = cryptoRandomString({length: 10, type: 'numeric'});
    return key;
  },

  getMatchQuestion: async (key) => {
    try {
      let result = await matchModel.queryGetMatchQuestion(key);
      let questionID = result[0].question_id;
      return questionID;
    } catch (err) {
      console.log(err);
    }
  },

  insertMatchDetail: async (matchID, questionID, user) => {
    // +++++++ transaction
    try  {
      let rowNumber = await matchModel.queryCountMatchDetailRows(matchID, user);
      // make sure there are no duplicated rows
      if (rowNumber[0]['COUNT (*)'] === 0) {
        await matchModel.queryInsertMatchDetail(matchID, questionID, user);
      }
    } catch (err) {
      console.log(err);
    }
  },

  getMatchStartTime: async (key) => {
    try {
      let result = await matchModel.queryGetMatchStartTime(key);
      return result[0].match_start_time;
    } catch (err) {
      console.log(err);
    }
  },

  updateMatchDetail: async (matchID, user, code, correctness, execTime, answerTime) => {
    try {
      let result = await matchModel.queryUpdateMatchDetail(matchID, user, code, correctness, execTime, answerTime);
    } catch (err) {
      console.log(err);
    }
  },

  getSubmitNumber: async (matchID) => {
    try {
      let result = await matchModel.queryGetSubmitNumber(matchID);
      return result[0]['COUNT (*)'];
    } catch (err) {
      console.log(err);
    }
  },

  getMatchDetailPastExecTime: async (question_id) => {
    try {
      let result = await matchModel.queryGetMatchDetailPastExecTime(question_id);
      console.log('getMatchDetailPastExecTime result', result)
      return result; // 形式？
    } catch (err) {
      console.log(err)
    }
  }


}
  
