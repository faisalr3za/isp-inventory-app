import express from 'express';
import { GoodOutRequestController } from '../controllers/goodOutRequestController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create request
router.post('/', GoodOutRequestController.createRequest);

// Get all requests
router.get('/', GoodOutRequestController.getRequests);

// Get single request
router.get('/:id', GoodOutRequestController.getRequest);

// Approve request
router.put('/:id/approve', GoodOutRequestController.approveRequest);

// Reject request
router.put('/:id/reject', GoodOutRequestController.rejectRequest);

// Get pending request count
router.get('/pending/count', GoodOutRequestController.getPendingCount);

// Cancel request
router.delete('/:id', GoodOutRequestController.cancelRequest);

export default router;
