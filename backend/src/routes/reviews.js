const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/rbac');
const auth = require('../middleware/auth');
const { Review } = require('../models');
const { reviewSchema } = require('../utils/validator');

const createReview = async (req, res) => {
  try {
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: error.details[0].message });
    }

    const order = await require('../models').Order.findByPk(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Can only review your own orders' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, error: 'INVALID_STATE', message: 'Can only review delivered orders' });
    }

    const existing = await Review.findOne({ where: { order_id: order.id } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'ALREADY_REVIEWED', message: 'Order already reviewed' });
    }

    const review = await Review.create({
      user_id: req.user.id,
      order_id: order.id,
      rating: value.rating,
      comment: value.comment,
    });

    res.status(201).json({ success: true, data: review, message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const getOrderReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      where: { order_id: req.params.orderId },
      include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'name'] }],
    });

    if (!review) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

router.post('/:orderId', auth.authenticate, authorize('customer'), createReview);
router.get('/:orderId', auth.authenticate, getOrderReview);

module.exports = router;
