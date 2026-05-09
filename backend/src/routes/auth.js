const express = require('express');
const router = express.Router();
const { register, login, me, googleLogin, updateProfile, getDashboardCounts } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.get('/counts', authenticate, getDashboardCounts);

module.exports = router;
