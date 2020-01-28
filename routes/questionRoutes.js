const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const bodyparser=require("body-parser");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));

router.post('/insert', (req, res)=> {
  questionController.insert(req);
  console.log('Question inserted!');
})

module.exports = router;