const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const bodyparser = require("body-parser");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:true}));

// 路徑是 /api/v1/match

router.post('/insert_match', async (req, res) => {
  let result = await matchController.insertMatch(req.body.userID, req.body.questionID, req.body.matchKey);
  res.send(result);
});

router.post('/get_key', (req, res) => {
  let key = matchController.getKey();
  res.send(key);
})

module.exports = router;