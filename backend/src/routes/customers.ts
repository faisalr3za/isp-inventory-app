import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  GET /api/customers
// @desc   Get customers
// @access Private
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Customers routes - coming soon'
  });
}));

export default router;
