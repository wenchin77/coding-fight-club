const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// 路徑是 /api/v1/question

router.post('/insert_question', questionController.insertQuestion);

router.post('/insert_test', questionController.insertTest);

router.get('/:category', questionController.selectQuestions);

module.exports = router;