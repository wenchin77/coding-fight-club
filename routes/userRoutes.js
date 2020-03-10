const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 路徑是 /api/v1/user
router.post('/signup', userController.signup);

router.post('/signin', userController.signin);

router.get('/leaderboard', userController.getLeaderboard);

router.post('/get_user_profile', userController.getUserProfile);

router.get('/github_redirect', userController.githubRedirect);

router.post('/bug_report', userController.reportBugs);

module.exports = router;
