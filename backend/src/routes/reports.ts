import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  GET /api/reports/inventory
// @desc   Get inventory reports
// @access Private
router.get('/inventory', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Reports routes - coming soon'
  });
}));

export default router;
