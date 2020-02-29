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
        console.error("Username taken...");
        res.status(403).send(errors.usernameTakenError);
        return;
      }

      // check in db if email exists
      let userNumByEmail = await userController.countUsersByEmail(data.email);
      if (userNumByEmail > 0) {
        console.error("Account with this email taken...");
        res.status(403).send(errors.userEmailTakenError);
        return;
      }

      let result = await userController.insertUser(data);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(errors.serverError);
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
