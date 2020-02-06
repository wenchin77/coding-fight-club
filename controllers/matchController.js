const cryptoRandomString = require('crypto-random-string');
const matchModel = require('../models/match');

module.exports = {
  
  insertMatch: async (user_id_1, question_id, key) => {
    // generate a random no as match key to put in url
    let data = {
      user_id_1,
      question_id,
      match_key: key
    }
    console.log('insertMatch at matchController ----', data)
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
  }
  
}
  
