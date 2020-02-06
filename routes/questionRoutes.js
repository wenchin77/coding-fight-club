const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const bodyparser = require("body-parser");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));

// 路徑是 /api/v1/question

router.post('/insert_question', (req, res)=> {
  questionController.insertQuestion(req, res);
});

router.post('/insert_test', (req, res)=> {
  questionController.insertTest(req, res);
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