const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const questionController = require('../controllers/questionController');
const bodyparser = require("body-parser");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));

// 路徑是 /api/v1/match

router.post('/get_key', (req, res) => {
  let key = matchController.getKey();
  res.send(key);
});

router.post('/insert_match', (req, res) => {
  let result = matchController.insertMatch(req.body.userID, req.body.questionID, req.body.matchKey);
  res.send(result);
});

router.post('/get_matchid', async (req, res) => {
  let key = req.query.matchkey;
  let matchid = await matchController.getMatchId(key);
  res.json(matchid); // had to turn it into a string or json otherwise this error would occur in terminal "express deprecated res.send(status): Use res.sendStatus(status) instead"
});

router.post('/result/details', async (req, res) => {
  let userID = req.query.userid;
  let matchID = req.query.matchid;
  let result = await matchController.getMatchDetails(userID, matchID);
  console.log('getMatchDetails ----', result)

  let questionID = result[0].question_id;
  let question = await questionController.selectQuestion(questionID);
  console.log('question ----', question);

  let final = {
    matchResult: result,
    question
  }
  res.send(final);
});

module.exports = router;