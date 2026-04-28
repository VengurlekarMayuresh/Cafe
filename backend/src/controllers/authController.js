const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../utils/validator');

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

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, error: 'ACCOUNT_PENDING', message: 'Account pending approval' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, error: 'ACCOUNT_BLOCKED', message: 'Account has been blocked' });
    }

    const token = generateToken(user);
    const userData = user.toJSON();
    delete userData.password;

    res.json({ success: true, data: { user: userData, token }, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const me = async (req, res) => {
  const userData = req.user.toJSON();
  delete userData.password;
  res.json({ success: true, data: userData });
};

module.exports = { register, login, me };
