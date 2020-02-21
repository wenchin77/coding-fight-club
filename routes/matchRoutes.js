const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const questionController = require('../controllers/questionController');

// 路徑是 /api/v1/match


router.post('/get_key', (req, res) => {
  let key = matchController.getKey();
  res.send(key);
});

router.post('/insert_match', (req, res) => {
  let result = matchController.insertMatch(req.body.questionID, req.body.matchKey);
  res.send(result);
});

router.post('/get_matchid', async (req, res) => {
  let key = req.query.matchkey;
  let matchid = await matchController.getMatchId(key);
  res.json(matchid); // had to turn it into a string or json otherwise this error would occur in terminal "express deprecated res.send(status): Use res.sendStatus(status) instead"
});

router.post('/result/details', async (req, res) => {
  let matchID = req.query.matchid;
  let result = await matchController.getMatchDetails(matchID);

  let questionID = result[0].question_id;
  let question = await questionController.selectQuestion(questionID);

  let final = {
    matchResult: result,
    question
  }
  res.send(final);
});

router.post('/result/summary', async (req, res) => {
  let userID = req.query.userid;
  console.log('userID', parseInt(userID))
  let result = await matchController.getMatchSummary(parseInt(userID));
  res.send(result);
});

router.post('/result/past_performance', async (req, res) => {
  let questionID = req.query.questionid;
  // performance 拉之前寫過這題的所有 execTime，看分布在哪 
  let result = await matchController.getMatchDetailPastExecTime(questionID);
  if (!result[0]) {
    res.send('N/A');
    return;
  }
  let timeAdded = 0;
  for (let i=0; i<result.length; i++) {
    timeAdded += parseInt(result[i].large_exec_time);
  }
  let avgTime = timeAdded / result.length;
  res.json(avgTime);
});

module.exports = router;