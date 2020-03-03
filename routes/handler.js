const errors = require("../util/errors");

function signup(userController) {
  return async (req, res) => {
    try {
      let data = req.body;
      // req.body eg. { username: '1234', email: '1234@com', password: '1234' }
      // check in db if username exists
      let userNumByUsername = await userController.countUsersByUserName(
        data.username
      );
      if (userNumByUsername > 0) {
        throw (errors.usernameTakenError);
      }
      // check in db if email exists
      let userNumByEmail = await userController.countUsersByEmail(data.email);
      if (userNumByEmail > 0) {
        throw (errors.userEmailTakenError);
      }
      let result = await userController.insertUser(data);
      res.status(200).send(result);
    } catch (err) {
      console.log('catched err', err)
      res.status(err.statusCode).send(err.message);
    }
  };
}

function getLeaderboard(userController) {
  return async (req, res) => {
    try {
      let result = await userController.selectLeaderboardUsers();
      res.json(result);
    } catch (e) {
      res.status(404).send(e);
    }
  };
}

module.exports = { getLeaderboard, signup };
