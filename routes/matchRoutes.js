const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const bodyparser = require("body-parser");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));

// 路徑是 /api/v1/match

// router.post('/insert_question', (req, res)=> {
//   questionController.insertQuestion(req, res);
// });

// router.post('/insert_test', (req, res)=> {
//   questionController.insertTest(req, res);
// });

// router.get('/:category', async (req, res)=> {
//   let category = req.params.category;
//   let difficulty = req.query.difficulty;
//   console.log(category);
//   console.log(difficulty);
//   let questions = await questionController.selectQuestions(category, difficulty);
//   // 之後放 cache 以後從 cache 拿出來篩 random
//   let randomIndex = Math.floor((Math.random() * questions.length));
//   let question = questions[randomIndex];
//   console.log('questions data', question);

//   res.send({question});
// });

router.post('/insert_match', async (req, res) => { 
  // get match id and add to response
  let question_id = req.question_id;
  let user_id = req.user_id;
  console.log(question_id);
  console.log(user_id)
  let match = await matchController.insertMatch(user_id, question_id);
  console.log(match);
  res.send(match);
})

module.exports = router;