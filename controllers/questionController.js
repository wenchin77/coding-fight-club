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

  selectQuestions: async (category, difficulty) => {
    try {
      if (category === 'all') {
        let result = await questionModel.querySelectAllQuestions(difficulty);
        return result;
      }
      let result = await questionModel.querySelectQuestions(category, difficulty);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  selectQuestion: async (question_id) => {
    try {
      let result = await questionModel.querySelectQuestion(question_id);
      let questionObj = result[0];
      return questionObj;
    } catch (err) {
      console.log(err);
    }
  },

  selectSampleTestCase: async (question_id) => {
    console.log('進入 questionController selectSampleTestCase')
    try {
      let result = await questionModel.querySelectSampleTestCase(question_id);
      let firstTestCase = result[0];
      console.log('questionController selectSampleTestCase result ----', firstTestCase)
      return firstTestCase;
    } catch (err) {
      console.log(err);
    }
  }


  


};
