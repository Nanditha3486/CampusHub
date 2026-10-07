import express from 'express';
import {
  getResources,
  createResource,
  toggleUpvoteResource,
  toggleBookmarkResource,
} from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getResources);
router.post('/', protect, createResource);
router.post('/:id/upvote', protect, toggleUpvoteResource);
router.post('/:id/bookmark', protect, toggleBookmarkResource);

export default router;
