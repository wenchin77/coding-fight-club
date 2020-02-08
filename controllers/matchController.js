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
      console.log('matchID: ', getMatchID[0].id);
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
    try{
      let result = await matchModel.queryGetMatchQuestion(key);
      let questionID = result[0].question_id;
      return questionID;
    } catch (err) {
      console.log(err);
    }
  },

  insertMatchDetail: async (matchID, questionID, user1, user2) => {
    // +++++++ transaction
    try{
      await matchModel.queryInsertMatchDetail(matchID, questionID, user1);
      await matchModel.queryInsertMatchDetail(matchID, questionID, user2);
    } catch (err) {
      console.log(err);
    }
  },

}
  
