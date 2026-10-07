import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Event } from '../models/Event.js';
import { Team } from '../models/Team.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const reportContent = async (req, res) => {
  try {
    const { contentType, targetId, reason } = req.body;
    const userId = req.user._id || req.user.id;

    if (!contentType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide contentType, targetId, and reason' });
    }

    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const report = await Report.create({
        reporter: userId,
        contentType,
        targetId,
        reason,
      });
      return res.status(201).json({ success: true, message: 'Content reported to CampusHub moderators', report });
    } else {
      const reportId = 'rep_' + memoryStore.generateId();
      const report = {
        _id: reportId,
        id: reportId,
        reporter: req.user,
        contentType,
        targetId,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      memoryStore.reports.unshift(report);
      return res.status(201).json({ success: true, message: 'Content reported to CampusHub moderators', report });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const reports = await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 });
      return res.json({ success: true, reports });
    } else {
      return res.json({ success: true, reports: memoryStore.reports });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'resolved' or 'dismissed'
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const report = await Report.findById(id);
      if (report) {
        report.status = status || 'resolved';
        await report.save();
      }
      return res.json({ success: true, report });
    } else {
      const report = memoryStore.reports.find((r) => r._id === id || r.id === id);
      if (report) report.status = status || 'resolved';
      return res.json({ success: true, report });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const usersCount = await User.countDocuments();
      const postsCount = await Post.countDocuments();
      const eventsCount = await Event.countDocuments();
      const teamsCount = await Team.countDocuments();

      return res.json({
        success: true,
        stats: {
          users: usersCount,
          posts: postsCount,
          events: eventsCount,
          teams: teamsCount,
          dbMode: 'MongoDB',
        },
      });
    } else {
      return res.json({
        success: true,
        stats: {
          users: memoryStore.users.length,
          posts: memoryStore.posts.length,
          events: memoryStore.events.length,
          teams: memoryStore.teams.length,
          dbMode: 'In-Memory Demo Mode',
        },
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
