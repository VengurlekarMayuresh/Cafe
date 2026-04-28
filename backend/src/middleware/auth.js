const jwt = require('jsonwebtoken');
require('dotenv').config();

const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'User not found' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, error: 'ACCOUNT_BLOCKED', message: 'Your account has been blocked' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, error: 'ACCOUNT_PENDING', message: 'Your account is pending approval' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'TOKEN_EXPIRED', message: 'Token has expired' });
    }
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Invalid token' });
  }
};

module.exports = { authenticate };
