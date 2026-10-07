import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLikePost,
  getPostComments,
  addComment,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLikePost);
router.get('/:id/comments', getPostComments);
router.post('/:id/comments', protect, addComment);

export default router;
