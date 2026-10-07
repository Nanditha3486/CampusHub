import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campushub_jwt_secret_key_2026_super_secure', {
    expiresIn: '7d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, college, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        college: college || 'MIT World Peace University',
        department: department || 'Computer Science',
        role: email.includes('admin') ? 'admin' : 'student',
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: user.toJSON(),
      });
    } else {
      const userExists = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = 'user_' + memoryStore.generateId();

      const newUser = {
        _id: userId,
        id: userId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        college: college || 'MIT World Peace University',
        department: department || 'Computer Science',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
        bio: 'CampusHub member passionate about software engineering.',
        skills: ['JavaScript', 'React'],
        interests: ['Web Development', 'Hackathons'],
        githubUrl: '',
        portfolioUrl: '',
        role: email.includes('admin') ? 'admin' : 'student',
        savedPosts: [],
        bookmarkedResources: [],
        createdAt: new Date().toISOString(),
      };

      memoryStore.users.push(newUser);
      const token = generateToken(userId);
      const { password: p, ...safeUser } = newUser;

      return res.status(201).json({
        success: true,
        token,
        user: safeUser,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: user.toJSON(),
      });
    } else {
      const user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id || user.id);
      const { password: p, ...safeUser } = user;

      return res.json({
        success: true,
        token,
        user: safeUser,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, college, department, bio, skills, interests, githubUrl, portfolioUrl, avatar } = req.body;
    const userId = req.user._id || req.user.id;
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) user.name = name;
      if (college) user.college = college;
      if (department) user.department = department;
      if (bio !== undefined) user.bio = bio;
      if (skills) user.skills = skills;
      if (interests) user.interests = interests;
      if (githubUrl !== undefined) user.githubUrl = githubUrl;
      if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
      if (avatar) user.avatar = avatar;

      await user.save();
      return res.json({ success: true, user: user.toJSON() });
    } else {
      const userIndex = memoryStore.users.findIndex((u) => u._id === userId || u.id === userId);
      if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });

      const targetUser = memoryStore.users[userIndex];
      if (name) targetUser.name = name;
      if (college) targetUser.college = college;
      if (department) targetUser.department = department;
      if (bio !== undefined) targetUser.bio = bio;
      if (skills) targetUser.skills = skills;
      if (interests) targetUser.interests = interests;
      if (githubUrl !== undefined) targetUser.githubUrl = githubUrl;
      if (portfolioUrl !== undefined) targetUser.portfolioUrl = portfolioUrl;
      if (avatar) targetUser.avatar = avatar;

      const { password, ...safeUser } = targetUser;
      return res.json({ success: true, user: safeUser });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
