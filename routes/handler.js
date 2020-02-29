function singup(userController) {}

function getLeaderboard(userController) {
  return async (req, res) => {
    try {
      let result = await userController.selectLeaderboardUsers();
      res.json(result);
    } catch (e) {
      res.status(404).send(e);
    }
  };
};

module.exports = { getLeaderboard };
