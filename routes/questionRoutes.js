const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const bodyparser=require("body-parser");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));

// 路徑是 /api/v1/question

router.post('/insert_question', async (req, res)=> {
  let data = await questionController.insert_question(req);
  res.send(`Question inserted: ${JSON.stringify(data)}`);
});

router.post('/insert_test', async (req, res)=> {
  let data = await questionController.insert_test(req);
  res.send(`Test data inserted: ${JSON.stringify(data)}`);
});

router.get('/all', async (req, res)=> {
  let data = await questionController.questions();
  res.send({data});
});

router.get('')

module.exports = router;