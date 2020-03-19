const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// 路徑是 /api/v1/match

router.get('/key', matchController.getKey);

router.post('/', matchController.insertMatch);

router.get('/result/details', matchController.getMatchDetails);

router.get('/result/summary', matchController.getMatchSummary);

router.get('/result/all', matchController.getMatchHistory);

router.get('/result/past_performance', matchController.getMatchDetailPastExecTime);

module.exports = router;