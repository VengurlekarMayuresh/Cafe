const { Order, OrderItem, Product, User, Notification } = require('../models');
const { createOrderSchema } = require('../utils/validator');
const { Op } = require('sequelize');

const getOrders = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'customer' || req.query.me === 'true') {
      where.user_id = req.user.id;
    }

    const { status, from_date, to_date, limit = 20, offset = 0 } = req.query;
    if (status) where.status = status;
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

const getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone', 'building', 'flat'] },
        { model: User, as: 'handler', attributes: ['id', 'name'] },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: error.details[0].message });
    }

    if (req.user.status !== 'approved') {
      return res.status(403).json({ success: false, error: 'NOT_APPROVED', message: 'Your account is pending approval by the admin. You cannot place orders yet.' });
    }

    const productIds = value.items.map(i => i.product_id);
    const products = await Product.findAll({ where: { id: productIds, is_available: true } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, error: 'PRODUCT_UNAVAILABLE', message: 'Some products are unavailable' });
    }

    const productMap = {};
    products.forEach(p => productMap[p.id] = p);

    const total_price = value.items.reduce((sum, item) => {
      return sum + (parseFloat(productMap[item.product_id].price) * item.qty);
    }, 0);

    const order = await Order.create({
      user_id: req.user.id,
      order_type: 'online',
      status: 'pending',
      total_price,
    });

    const items = value.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.qty,
      price: productMap[item.product_id].price,
    }));
    await OrderItem.bulkCreate(items, { validate: true });

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
      ],
    });

    // Notify all staff
    const staff = await User.findAll({ where: { role: 'staff', status: 'approved' } });
    const notifications = staff.map(s => ({
      user_id: s.id,
      type: 'new_order',
      message: `New order #${order.id.slice(0, 8)} from ${req.user.name}`,
    }));
    await Notification.bulkCreate(notifications);

    res.status(201).json({ success: true, data: fullOrder, message: 'Order placed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'handler', attributes: ['name'] }]
    });
    if (!order) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Order not found' });
    }

    if (order.status !== 'pending' || order.handled_by) {
      const handlerName = order.handler ? order.handler.name : 'another staff member';
      return res.status(409).json({ 
        success: false, 
        error: 'ALREADY_ASSIGNED', 
        message: `This order has already been taken by ${handlerName}` 
      });
    }

    await order.update({ status: 'accepted', handled_by: req.user.id });

    // Notify customer
    if (order.user_id) {
      await Notification.create({
        user_id: order.user_id,
        type: 'order_accepted',
        message: `Your order #${order.id.slice(0, 8)} has been accepted`,
      });
    }

    const updated = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'handler', attributes: ['id', 'name'] },
      ],
    });

    res.json({ success: true, data: updated, message: 'Order accepted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Order not found' });
    }

    if (order.status !== 'accepted') {
      return res.status(400).json({ success: false, error: 'INVALID_STATE', message: 'Order must be accepted first' });
    }

    if (order.handled_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'NOT_OWNER', message: 'Only the accepting staff can deliver' });
    }

    const { payment_method } = req.body;
    await order.update({ 
      status: 'delivered',
      payment_method: payment_method || 'offline',
      payment_status: 'paid'
    });

    if (order.user_id) {
      await Notification.create({
        user_id: order.user_id,
        type: 'order_delivered',
        message: `Your order #${order.id.slice(0, 8)} has been delivered`,
      });
    }

    const updated = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'handler', attributes: ['id', 'name'] },
      ],
    });

    res.json({ success: true, data: updated, message: 'Order delivered' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'INVALID_STATE', message: 'Order cannot be rejected' });
    }

    await order.update({ status: 'rejected' });

    if (order.user_id) {
      await Notification.create({
        user_id: order.user_id,
        type: 'order_rejected',
        message: `Your order #${order.id.slice(0, 8)} has been rejected`,
      });
    }

    res.json({ success: true, data: order, message: 'Order rejected' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const createOnsiteOrder = async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: error.details[0].message });
    }

    const productIds = value.items.map(i => i.product_id);
    const products = await Product.findAll({ where: { id: productIds } });
    const productMap = {};
    products.forEach(p => productMap[p.id] = p);

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, error: 'PRODUCT_NOT_FOUND', message: 'Some products not found' });
    }

    const total_price = value.items.reduce((sum, item) => {
      return sum + (parseFloat(productMap[item.product_id].price) * item.qty);
    }, 0);

    const { payment_method } = req.body;
    const order = await Order.create({
      user_id: null,
      order_type: 'onsite',
      status: 'delivered',
      handled_by: req.user.id,
      total_price,
      payment_status: 'paid',
      payment_method: payment_method || 'offline'
    });

    const items = value.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.qty,
      price: productMap[item.product_id].price,
    }));
    await OrderItem.bulkCreate(items, { validate: true });

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'handler', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json({ success: true, data: fullOrder, message: 'POS order created' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = { getOrders, getOrder, createOrder, acceptOrder, deliverOrder, rejectOrder, createOnsiteOrder };
