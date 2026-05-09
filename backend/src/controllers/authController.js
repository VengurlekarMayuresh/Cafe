const { User, Order } = require('../models');
const { generateToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../utils/validator');
const { Op } = require('sequelize');
const admin = require('../config/firebase');

const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: error.details[0].message });
    }

    const existing = await User.findOne({ where: { phone: value.phone } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'PHONE_EXISTS', message: 'Phone number already registered' });
    }

    const user = await User.create({
      name: value.name,
      phone: value.phone,
      password: value.password,
      role: 'customer',
      building: value.building,
      flat: value.flat,
      status: 'pending',
    });

    const token = generateToken(user);
    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({ success: true, data: { user: userData, token }, message: 'Registration successful. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: error.details[0].message });
    }

    const user = await User.findOne({ where: { phone: value.phone } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' });
    }

    const valid = await user.validatePassword(value.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, error: 'ACCOUNT_BLOCKED', message: 'Account has been blocked' });
    }

    const token = generateToken(user);
    const userData = user.toJSON();
    delete userData.password;

    // Check if profile is complete
    const isIncomplete = !userData.name || !userData.phone || !userData.building || !userData.flat;

    res.json({ 
      success: true, 
      data: { user: userData, token, isIncomplete }, 
      message: user.status === 'pending' ? 'Login successful. Note: Order features will be enabled after admin approval.' : 'Login successful' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};


const googleLogin = async (req, res) => {
  const { idToken, googleId, email, name } = req.body; 

  try {
    if (!idToken) {
       return res.status(400).json({ success: false, message: 'Missing ID Token' });
    }

    // Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (verifyErr) {
      console.error('Firebase Token Verification Failed:', verifyErr.message);
      return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Token verification failed: ' + verifyErr.message });
    }

    if (!decodedToken || decodedToken.uid !== googleId) {
      console.error('Token UID mismatch. Decoded:', decodedToken?.uid, 'Provided:', googleId);
      return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Authentication mismatch' });
    }

    let user = await User.findOne({ where: { googleId } });
    if (!user) {
      // Check if user with same email exists
      user = await User.findOne({ where: { email } });
      if (user) {
        // Link googleId to existing account
        await user.update({ googleId });
        console.log('Linked Google ID to existing user:', email);
      } else {
        // Create new user
        user = await User.create({
          googleId,
          email,
          name,
          status: 'pending',
          role: 'customer'
        });
        console.log('Created new Google user:', email);
      }
    }

    const token = generateToken(user);
    const userData = user.toJSON();
    delete userData.password;

    const isIncomplete = !userData.name || !userData.phone || !userData.building || !userData.flat;

    res.json({ success: true, data: { user: userData, token, isIncomplete } });
  } catch (err) {
    console.error('Backend Google Login Critical Error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'SERVER_ERROR', 
      message: 'Login processing failed: ' + err.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, building, flat } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });
    }

    // Check if phone is being changed and if it already exists
    if (phone && phone !== user.phone) {
      const existing = await User.findOne({ where: { phone } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'PHONE_EXISTS', message: 'This phone number is already registered to another account.' });
      }
    }

    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
      building: building || user.building,
      flat: flat || user.flat
    });

    const userData = user.toJSON();
    delete userData.password;
    const isIncomplete = !userData.name || !userData.phone || !userData.building || !userData.flat;

    res.json({ success: true, data: { ...userData, isIncomplete }, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'SERVER_ERROR', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

const me = async (req, res) => {
  const userData = req.user.toJSON();
  delete userData.password;
  const isIncomplete = !userData.name || !userData.phone || !userData.building || !userData.flat;
  res.json({ success: true, data: { ...userData, isIncomplete } });
};

const getDashboardCounts = async (req, res) => {
  try {
    const counts = {
      pendingUsers: 0,
      pendingOrders: 0,
      acceptedOrders: 0
    };

    if (req.user.role === 'admin') {
      counts.pendingUsers = await User.count({ where: { status: 'pending' } });
    }

    if (req.user.role === 'staff' || req.user.role === 'admin') {
      counts.pendingOrders = await Order.count({ where: { status: 'pending' } });
      
      const acceptedWhere = { status: 'accepted' };
      if (req.user.role === 'staff') {
        acceptedWhere.handled_by = req.user.id;
      }
      counts.acceptedOrders = await Order.count({ where: acceptedWhere });
    }

    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, googleLogin, updateProfile, me, getDashboardCounts };
