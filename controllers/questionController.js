const AppError = require('../util/appError');
// sql 語句拆到 model/question 去
const questionModel = require('../models/question')

module.exports = {
  insert: async (req, res) => {
    let question = {
      question_name: req.body.title,
      question_text: req.body.description,
      question_code: req.body.code,
      difficulty: req.body.difficulty,
      category: req.body.category
    };
    let result = await questionModel.queryInsertQuestion(question);
  }
};
