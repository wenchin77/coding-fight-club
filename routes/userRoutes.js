const express = require('express');
const router = express.Router();
// request: to get google profile
const request = require("request");
const axios = require('axios');
const userController = require('../controllers/userController');
const handler = require('./handler');
// for github clientid & client secret
require('dotenv').config();


// 路徑是 /api/v1/user
router.post('/signup', userController.signup());

router.post('/get_user_info', async (req, res) => {
  let token = req.query.token;
  let result = await userController.selectUserByToken(token);
  res.json(result);
});

router.post('/signin', async (req, res)=> {
  let data = req.body;
  console.log(data)
  // req.body eg. { email: '1234@com', password: '1234' }

  // native 
  if (data.password) {
    data.provider = 'native';
    // check in db if email exists
    let userNumByEmail = await userController.countUsersByEmail(data.email);
    if (userNumByEmail === 0) {
      res.status(403).send({
        error: 'This email has not been registered. Wanna sign up instead?'
      });
      return;
    };

    // check if password match (encrypted first)
    let passwordCheck = await userController.countPasswordEmailMatch(data.email, data.password);
    if (passwordCheck === 0) {
      res.status(403).send({error: 'Wrong password. Signin failed.'})
      return;
    }
    // check if token's not expired, if not send back the same token, if so set a new token
    let result = await userController.updateUser(data);
    res.status(200).send(result);
    return;
  }

  // google 
  if (data.provider === 'google') {
    console.log('getting ajax for google signin...')
    // Get profile from google
    try {
      let profile = await getGoogleProfile(data.access_token);
      if (!profile.name || !profile.email) {
        res.status(400).send({error: "Permissions Error: name and email are required when you sign in with a Google account."});
        return;
      }

      // check in db if email exists
      let userNumByEmail = await userController.countUsersByEmail(profile.email);
      if (userNumByEmail === 0) {
        console.log('google user not found, inserting...')
        // if not insert user
        let result = await userController.insertGoogleUser(profile);
        res.status(200).send(result);
        return;
      };

      // check if token's not expired, if not send back the same token, if so set a new token
      console.log('google user found, updating...')
      let result = await userController.updateGoogleUser(profile);
      res.status(200).send(result);
    } catch (error) {
      console.log(error)
      res.status(500).send({error: 'Server error. Please try again later.'});
    };
    return;
  };

  // github
  if (data.provider === 'github') {
    console.log('getting ajax for github signin... data:', data);
    try {
      if (!data.name || !data.email) {
        res.status(400).send({error: "Permissions Error: name and email are required when you sign in with a Github account."});
        return;
      }

      // check in db if email exists
      let userNumByEmail = await userController.countUsersByEmail(data.email);
      if (userNumByEmail === 0) {
        console.log('github user not found, inserting...')
        // if not insert user
        let result = await userController.insertGithubUser(data);
        res.status(200).send(result);
        return;
      };

      // check if token's not expired, if not send back the same token, if so set a new token
      console.log('github user found, updating...')
      let result = await userController.updateGithubUser(data);
      res.status(200).send(result);
    } catch (error) {
      console.log(error)
      res.status(500).send({error: 'Server error. Please try again later.'});
    };
    return;
    
  };

  if (data.provider === 'facebook') {
    // do stuff
  };
});

// github
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

function getGoogleProfile (accessToken) {
	return new Promise((resolve, reject) => {
		if(!accessToken){
			resolve(null);
			return;
    };
    let url = `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`
		request(url, (error, res, body) => {
      if (error) {
        console.log(error)
      }
      console.log(body);
      body = JSON.parse(body);
      if(body.error) {
        reject(body.error);
      } else {
        resolve(body);
      }
    })
	})
};

router.get('/leaderboard', handler.getLeaderboard(userController));

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
