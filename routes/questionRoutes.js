const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const bodyparser=require("body-parser");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));

// 路徑是 /api/v1/question

router.post('/insert_question', (req, res)=> {
  questionController.insertQuestion(req, res);
});

router.post('/insert_test', (req, res)=> {
  questionController.insertTest(req, res);
});

router.get('/all', async (req, res)=> {
  let data = await questionController.selectAllQuestions();
  console.log('questions data',data);
  res.send({data});
});

router.get('')

module.exports = router;