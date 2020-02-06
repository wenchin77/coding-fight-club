// const AppError = require('../util/appError');
// sql 語句拆到 model/question 去
const questionModel = require('../models/question')

module.exports = {
  insertQuestion: async (req, res) => {
    let question = {
      question_name: req.body.title,
      question_text: req.body.description,
      question_code: req.body.code,
      question_const: req.body.const,
      difficulty: req.body.difficulty,
      category: req.body.category
    };
    try {
      let result = await questionModel.queryInsertQuestion(question);
      // const [rows, fields] = await questionModel.queryInsertQuestion(question);  
      console.log(result);
      res.send(`Question inserted: ${JSON.stringify(question)}`);
    } catch (err) {
      console.log(err);
      res.send('Question insert error!')
    }
  },
  
  insertTest: async (req, res) => {
    let test =  {
      question_id: req.body.question_id,
      test_data: req.body.test_data,
      test_result: req.body.test_result
    }
    try {
      let result = await questionModel.queryInsertTest(test);
      console.log(result);
      res.send(`Test data inserted: ${JSON.stringify(test)}`);
    } catch (err) {
      console.log(err);
      res.send('Test insert error!');
    }
  },

  selectAllQuestions: async (req, res) => {
    let result = await questionModel.querySelectAllQuestion();
    return result;
  }
};
