const express = require('express');
const router = express.Router();
// request: to get google profile
const request = require("request");
const axios = require('axios');
const userController = require('../controllers/userController');
// for github clientid & client secret
require('dotenv').config();

// 路徑是 /api/v1/user
router.post('/signup', userController.signup());

router.post('/get_user_info', async (req, res) => {
  let token = req.query.token;
  let result = await userController.selectUserByToken(token);
  res.json(result);
});

router.post('/signin', userController.signin());

router.get('/github_redirect', async (req, res) => {
  console.log('github_redirect req.query.code: ', req.query.code);
  try{
    const requestToken = req.query.code;
    let clientID = process.env.GITHUB_CLIENTID;
    let clientSecret = process.env.GITHUB_CLIENTSECRET;
    let getTokenResult = await axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
      // Set the content type header, so that we get the response in JSON
      headers: {
        accept: 'application/json'
      }
    });
    console.log(getTokenResult.data)
    let accessToken = getTokenResult.data.access_token;
    res.redirect(`/signin?access_token=${accessToken}`);
  } catch (error) {
    console.log(error);
    res.status(500).send({error: 'Server error. Please try again later.'});
  }
});

// function getGoogleProfile (accessToken) {
// 	return new Promise((resolve, reject) => {
// 		if(!accessToken){
// 			resolve(null);
// 			return;
//     };
//     let url = `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`
// 		request(url, (error, res, body) => {
//       if (error) {
//         console.log(error)
//       }
//       console.log(body);
//       body = JSON.parse(body);
//       if(body.error) {
//         reject(body.error);
//       } else {
//         resolve(body);
//       }
//     })
// 	})
// };

router.get('/leaderboard', userController.getLeaderboard());

router.post('/bug_report', async (req, res) => {
  let token = req.query.token;
  let bug = req.query.bug;
  try {
    await userController.insertBugReport(token, bug);
    res.status(200).send(`Thanks! Here's the bug report you filed: ${bug}`);
  } catch (e) {
    res.status(404).send('Bug report error')
  }
}) 



module.exports = router;
