import express from 'express';
import { analyzeIdea } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/idea-lab', protect, analyzeIdea);

export default router;
