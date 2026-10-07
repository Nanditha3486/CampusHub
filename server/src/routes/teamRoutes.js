import express from 'express';
import {
  getTeams,
  createTeam,
  sendJoinRequest,
  getTeamRequests,
  respondToJoinRequest,
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTeams);
router.post('/', protect, createTeam);
router.post('/:id/request', protect, sendJoinRequest);
router.get('/:id/requests', protect, getTeamRequests);
router.put('/requests/:requestId', protect, respondToJoinRequest);

export default router;
