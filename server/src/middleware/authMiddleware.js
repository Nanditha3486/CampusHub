import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campushub_jwt_secret_key_2026_super_secure');
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }
      req.user = user;
    } else {
      const user = memoryStore.users.find((u) => u._id === decoded.id || u.id === decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User session invalid' });
      }
      const { password, ...userWithoutPass } = user;
      req.user = userWithoutPass;
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};
