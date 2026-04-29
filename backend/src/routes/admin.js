const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { getPendingUsers, approveUser, blockUser, getAllUsers, getAdminOrders, getAnalytics, deleteUser, changeUserPassword } = require('../controllers/adminController');

router.get('/users/pending', authenticate, authorize('admin'), getPendingUsers);
router.patch('/users/:id/approve', authenticate, authorize('admin'), approveUser);
router.patch('/users/:id/block', authenticate, authorize('admin'), blockUser);
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.get('/orders', authenticate, authorize('admin'), getAdminOrders);
router.get('/analytics', authenticate, authorize('admin'), getAnalytics);

router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
router.patch('/users/:id/password', authenticate, authorize('admin'), changeUserPassword);

module.exports = router;
