import { Notification } from '../models/Notification.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 });

      const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });
      return res.json({ success: true, unreadCount, notifications });
    } else {
      const userNotifs = memoryStore.notifications.filter((n) => {
        const recipId = n.recipient._id || n.recipient.id || n.recipient;
        return recipId === userId;
      });
      const unreadCount = userNotifs.filter((n) => !n.read).length;
      return res.json({ success: true, unreadCount, notifications: userNotifs });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const notif = await Notification.findById(id);
      if (notif && notif.recipient.toString() === userId.toString()) {
        notif.read = true;
        await notif.save();
      }
      return res.json({ success: true });
    } else {
      const notif = memoryStore.notifications.find((n) => n._id === id || n.id === id);
      if (notif) notif.read = true;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      await Notification.updateMany({ recipient: userId, read: false }, { read: true });
      return res.json({ success: true });
    } else {
      memoryStore.notifications.forEach((n) => {
        const recipId = n.recipient._id || n.recipient.id || n.recipient;
        if (recipId === userId) n.read = true;
      });
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
