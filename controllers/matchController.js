const cryptoRandomString = require('crypto-random-string');
const matchModel = require('../models/match');

module.exports = {
  
  insertMatch: async (user_id_1, question_id, match_key) => {
    console.log('進入 matchController')
    // generate a random no as match key to put in url
    let data = {
      user_id_1,
      question_id,
      match_key
    }
    try {
      let result = await matchModel.queryInsertMatch(data);
      return (result);
    } catch (err) {
      console.log(err);
    }
  },

  getKey: () => {
    let key = cryptoRandomString({length: 10, type: 'numeric'});
    return key;
  },

  getMatchQuestion: async (key) => {
    console.log('matchController key: ', key)
    try{
      let result = await matchModel.queryGetMatchQuestion(key);
      let questionID = result[0].question_id;
      console.log('matchController question_id: ', questionID)
      return questionID;
    } catch (err) {
      console.log(err);
    }
  },

}
  
