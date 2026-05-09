const express = require('express');
const router = express.Router();
const { register, login, me, googleLogin, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
