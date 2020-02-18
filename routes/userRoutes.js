const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const onlineUsers = {};

// 路徑是 /api/v1/user

let randomProperty = (obj, myToken) => {
  let keys = Object.keys(obj);
  if (keys.length <= 1) {
    return false;
  }
  let index = keys.length * Math.random() << 0;
  let strangerToken = keys[index];
  let result;
  if (strangerToken === myToken) {
    // if token 
    result = obj[keys[index%keys.length +1]]
  } else {
    result = obj[strangerToken];
  }
  console.log(result);
  return {result, strangerToken};
};

router.post('/get_online_user', (req, res) => {
  let token = req.query.token;
  let stranger = randomProperty(onlineUsers, token);
  if (!stranger) {
    res.status(403).send('We cannot find users online now... Try again later or invite a friend instead?')
  }
  res.status(200).send(stranger.result.username);
});

router.post('/ping', async (req, res) => {
  let token = req.query.token;
  // get username in db if it's not in memory
  if (!onlineUsers[token]) {
    let result = await userController.selectUserInfoByToken(token);
    onlineUsers[token] = {
      username: result[0].user_name, 
      time: Date.now()
    };
  }
  // set token as key and username as value
  onlineUsers[token].time = Date.now();
  res.status(200).send('ok');
});

// remove timeout users (3 min with no ping) in onlineUserList
// check every 30 sec
setInterval(() => {
  console.log('in setInterval')
  for (let prop in onlineUsers) {
    if((Date.now() - onlineUsers[prop].time) > 1000*60*3) {
      delete onlineUsers[prop];
      console.log('deleting user in onlineUsers...')
    }
  }
  console.log('onlineUsers in setInterval === ',onlineUsers);
}, 1000*20); // 之後調整成長一點


router.post('/signin', async (req, res)=> {
  let data = req.body;
  console.log(data)
  // req.body eg. { email: '1234@com', password: '1234' }

  // check in db if email exists
  let userNumByEmail = await userController.countUsersByEmail(data.email);
  console.log('userNumByEmail',userNumByEmail)
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

  let result = await userController.updateUser(data);
  res.status(200).send(result);
});



router.post('/signup', async (req, res)=> {
  let data = req.body;
  // req.body eg. { username: '1234', email: '1234@com', password: '1234' }

  // check in db if username exists
  let userNumByUsername = await userController.countUsersByUserName(data.username);
  if (userNumByUsername > 0) {
    console.log('Username taken...')
    res.status(403).send({
      error: 'Username already taken. Please pick another username.'
    });
    return;
  };

  // check in db if email exists
  let userNumByEmail = await userController.countUsersByEmail(data.email);
  if (userNumByEmail > 0) {
    console.log('Account with this email taken...')
    res.status(403).send({
      error: 'Looks like this email is signed up! Now go ahead and sign in.'
    });
    return;
  };

  let result = await userController.insertUser(data);
  res.status(200).send(result);
});

router.post('/get_userInfo', async (req, res) => {
  let token = req.query.token;
  let result = await userController.selectUserInfoByToken(token);
  res.json(result);
})


module.exports = router;
