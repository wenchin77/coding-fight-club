const matchModel = require('../models/match');

module.exports = {
  insertMatch: async (user_id_1, question_id) => {
    let data = {
      user_id_1: user_id_1,
      question_id: question_id
    }
    console.log('insertMatch @ matchController ----', data)
    try {
      let result = await matchModel.queryInsertMatch(data);
      return result;
    } catch (err) {
      console.log(err);
    }
  }
}
  
