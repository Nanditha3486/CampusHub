import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const getUsers = async (req, res) => {
  try {
    const { search, skill, college } = req.query;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      let query = {};
      if (skill) query.skills = skill;
      if (college) query.college = college;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { college: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } },
          { skills: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await User.find(query).select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, users });
    } else {
      let filtered = memoryStore.users.map(({ password, ...u }) => u);
      if (skill) {
        filtered = filtered.filter((u) => u.skills && u.skills.includes(skill));
      }
      if (college) {
        filtered = filtered.filter((u) => u.college === college);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.college.toLowerCase().includes(q) ||
            u.department.toLowerCase().includes(q) ||
            (u.skills && u.skills.some((s) => s.toLowerCase().includes(q)))
        );
      }
      return res.json({ success: true, count: filtered.length, users: filtered });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'Student profile not found' });
      return res.json({ success: true, user });
    } else {
      const user = memoryStore.users.find((u) => u._id === id || u.id === id);
      if (!user) return res.status(404).json({ success: false, message: 'Student profile not found' });
      const { password, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
