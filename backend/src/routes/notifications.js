const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getNotifications, markRead, deleteNotification } = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
