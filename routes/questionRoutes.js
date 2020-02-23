const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// 路徑是 /api/v1/question

router.post('/insert_question', async (req, res)=> {
  let question = {
    question_name: req.body.title,
    question_text: req.body.description,
    question_code: req.body.code,
    question_const: req.body.const,
    difficulty: req.body.difficulty,
    category: req.body.category
  };
  let result = await questionController.insertQuestion(question);
  res.send(result);
});

router.post('/insert_test', async (req, res)=> {
  let questionID = req.body.question_id;
  let data = req.body.test_data;
  let testResult = req.body.test_result;
  let large = req.body.is_large_case;
  let result = await questionController.insertTest(questionID, data, testResult, large);
  res.send(result);
});

router.get('/:category', async (req, res)=> {
  let category = req.params.category;
  let difficulty = req.query.difficulty;
  let questions = await questionController.selectQuestions(category, difficulty);
  // 之後放 cache 以後從 cache 拿出來篩 random
  let randomIndex = Math.floor((Math.random() * questions.length));
  let question = questions[randomIndex];
  res.send({question});
});

module.exports = router;