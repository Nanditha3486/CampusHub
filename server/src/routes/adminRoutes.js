import express from 'express';
import { reportContent, getReports, resolveReport, getPlatformStats } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/report', protect, reportContent);
router.get('/reports', protect, adminOnly, getReports);
router.put('/reports/:id', protect, adminOnly, resolveReport);
router.get('/stats', protect, getPlatformStats);

export default router;
