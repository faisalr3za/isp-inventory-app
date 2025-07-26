import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  GET /api/users/profile
// @desc   Get user profile
// @access Private
router.get('/profile', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'User routes - coming soon',
    data: (req as any).user
  });
}));

export default router;
