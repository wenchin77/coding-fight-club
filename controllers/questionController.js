const AppError = require('../util/appError');
// sql 語句拆到 model/question 去
const questionModel = require('../models/question')

module.exports = {
  insertQuestion: async (req, res) => {
    let question = {
      question_name: req.body.title,
      question_text: req.body.description,
      question_code: req.body.code,
      difficulty: req.body.difficulty,
      category: req.body.category
    };
    let result = await questionModel.queryInsertQuestion(question);
    return question;
  },
  insertTest: async (req, res) => {
    let test =  {
      question_id: req.body.question_id,
      test_data: req.body.test_data,
      test_result: req.body.test_result
    }
    let result = await questionModel.queryInsertTest(test);
    return test;
  },
  questions: async (req, res) => {
    let result = await questionModel.querySelectAllQuestion();
    return result;
  }
};
