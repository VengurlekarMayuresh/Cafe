const { Notification } = require('../models');

const getNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: notifications.rows, total: notifications.count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Notification not found' });
    }

    await notification.update({ is_read: true });
    res.json({ success: true, data: notification, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = { getNotifications, markRead, deleteNotification };
