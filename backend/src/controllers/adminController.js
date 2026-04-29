const { User, Order, OrderItem, Product, Review, Notification } = require('../models');
const { productSchema } = require('../utils/validator');
const { Op } = require('sequelize');

const getPendingUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const users = await User.findAndCountAll({
      where: { status: 'pending' },
      attributes: { exclude: ['password'] },
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']],
    });

    res.json({ success: true, data: users.rows, total: users.count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });
    }

    await user.update({ status: 'approved' });

    await Notification.create({
      user_id: user.id,
      type: 'account_approved',
      message: 'Your account has been approved. You can now login.',
    });

    const userData = user.toJSON();
    delete userData.password;

    res.json({ success: true, data: userData, message: 'User approved' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });
    }

    await user.update({ status: 'blocked' });

    await Notification.create({
      user_id: user.id,
      type: 'account_blocked',
      message: 'Your account has been blocked. Contact admin for details.',
    });

    const userData = user.toJSON();
    delete userData.password;

    res.json({ success: true, data: userData, message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0, role, status } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: users.rows, total: users.count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const { status, from_date, to_date, user_id, limit = 20, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (user_id) where.user_id = user_id;
    if (from_date) where.created_at = { [Op.gte]: new Date(from_date) };
    if (to_date) where.created_at = { ...where.created_at, [Op.lte]: new Date(to_date) };

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone', 'building', 'flat'] },
        { model: User, as: 'handler', attributes: ['id', 'name'] },
      ],
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: orders.rows, total: orders.count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total_price', { where: { status: 'delivered' } }) || 0;
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalProducts = await Product.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.count({ where: { created_at: { [Op.gte]: today } } });
    const todayRevenue = await Order.sum('total_price', { where: { created_at: { [Op.gte]: today }, status: 'delivered' } }) || 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        pendingOrders,
        totalCustomers,
        totalProducts,
        todayOrders,
        todayRevenue: parseFloat(todayRevenue).toFixed(2),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Cannot delete admin account' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });
    }

    await user.update({ password });
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = { getPendingUsers, approveUser, blockUser, getAllUsers, getAdminOrders, getAnalytics, deleteUser, changeUserPassword };
