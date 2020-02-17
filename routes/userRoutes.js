const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 路徑是 /api/v1/user

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
