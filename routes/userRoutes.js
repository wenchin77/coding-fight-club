const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const onlineUsers = {};

// 路徑是 /api/v1/user

// // 暫時暫停 ping --------------------------
// router.post('/get_stranger', async (req, res) => {
//   let token = req.query.token;
//   let category = req.query.category;
//   let difficulty = req.query.difficulty;
//   let stranger = await getStranger(onlineUsers, token);
//   if (!stranger) {
//     res.status(403).send('We cannot find users online now... Try again later or invite a friend instead?')
//   }
//   console.log('stranger', stranger);
//   // add to invitations 
//   onlineUsers[stranger.strangerToken].invited = {
//     inviter: token,
//     category,
//     difficulty
//   }
//   // console.log('onlineUsers ==== ',onlineUsers)
//   res.status(200).send('found someone');
// });

// router.get('/ping', async (req, res) => {
//   let token = req.query.token;
//   // get username in db if it's not in memory
//   if (!onlineUsers[token]) {
//     let result = await userController.selectUserInfoByToken(token);
//     onlineUsers[token] = {
//       username: result[0].user_name, 
//       time: Date.now(),
//       in_a_match: 0, // turn this to 1 in match page
//       invited: null
//     };
//   }
//   // update ping time
//   onlineUsers[token].time = Date.now();

//   // if there's an invitation notify the user
//   if (onlineUsers[token].invited) {
//     let result = await userController.selectUserInfoByToken(onlineUsers[token].invited.inviter);
//     let inviter = result[0].user_name;
//     let invitation =  onlineUsers[token].invited
//     res.status(200).send({inviter, category: invitation.category, difficulty: invitation.difficulty});
//     return;
//   }
//   res.status(200).send('ok');
// });

// remove timeout users (3 min with no ping) in onlineUserList
// check every 30 sec
// setInterval(() => {
//   console.log('in setInterval')
//   for (let prop in onlineUsers) {
//     if((Date.now() - onlineUsers[prop].time) > 1000*60*3) {
//       delete onlineUsers[prop];
//       console.log('deleting user in onlineUsers...')
//     }
//   }
//   // console.log('onlineUsers in setInterval === ',onlineUsers);
// }, 1000*20); // 之後調整成長一點



router.post('/signup', async (req, res)=> {
  let data = req.body;
  console.log(data)
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

router.post('/get_user_info', async (req, res) => {
  let token = req.query.token;
  let result = await userController.selectUserInfoByToken(token);
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
    console.log('getting ajax for google signin...', data)
    if (!data.access_token) {
      res.status(400).send({ error: "Request Error: can't find Google access token." });
      return;
    };
    // Get profile from google
    getGoogleProfile(data.access_token)
    .then((profile) => {
      if (!profile.name || !profile.email) {
        res.status(400).send({
          error: "Permissions Error: name, email are required."
        });
        return;
      }
      console.log('profile', profile)
      // insert / update user in controller


      res.send({
        user: {
          name: profile.name,
          email: profile.email,
          picture: profile.picture
        }
      });
    })
    .catch((error) => {
      res.status(500).send({ error });
    });
  }
  

});


let getGoogleProfile = (accessToken) => {
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
			}
		)
	})
};



router.post('/bug_report', async (req, res) => {
  let reporter = req.query.reporter;
  let bug = req.query.bug;
  console.log(reporter)
  console.log(bug)
  try {
    await userController.insertBugReport(reporter, bug);
    res.status(200).send('Bug report filed!')
  } catch (e) {
    res.status(500).send(e)
  }
}) 


let getStranger = (obj, myToken) => {
  let keys = Object.keys(obj);
  if (keys.length <= 1) {
    console.log('only 1 user online now...')
    return false;
  }
  let index = keys.length * Math.random() << 0;
  console.log('index', index)
  let strangerToken = keys[index];
  console.log('strangerToken',strangerToken)
  console.log('myToken', myToken)
  if (strangerToken === myToken) {
    console.log('token belongs to me, find the next person')
    // if token belongs to me, find the next person 
    let newIndex = index%keys.length +1
    let newResult = obj[keys[newIndex]];
    let newStrangerToken = keys[newIndex];
    return {result: newResult, strangerToken: newStrangerToken};
  } else {
    let result = obj[strangerToken];
    return {result, strangerToken};
  }
};



module.exports = router;
