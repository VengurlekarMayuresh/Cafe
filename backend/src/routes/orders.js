const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { getOrders, getOrder, createOrder, acceptOrder, deliverOrder, rejectOrder, createOnsiteOrder } = require('../controllers/orderController');

router.get('/', authenticate, getOrders);
router.post('/', authenticate, authorize('customer'), createOrder);
router.get('/:id', authenticate, getOrder);
router.patch('/:id/accept', authenticate, authorize('staff', 'admin'), acceptOrder);
router.patch('/:id/deliver', authenticate, authorize('staff', 'admin'), deliverOrder);
router.patch('/:id/reject', authenticate, authorize('staff', 'admin'), rejectOrder);
router.post('/onsite', authenticate, authorize('staff', 'admin'), createOnsiteOrder);

module.exports = router;
