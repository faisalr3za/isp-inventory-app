import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import { ActivityReportController } from '../controllers/activityReportController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  GET /api/activity-reports/statistics
// @desc   Get activity reports statistics
// @access Private
router.get('/statistics', asyncHandler(ActivityReportController.getStatistics));

// @route  GET /api/activity-reports
// @desc   Get all activity reports with filters and pagination
// @access Private
router.get('/', asyncHandler(ActivityReportController.getAllReports));

// @route  POST /api/activity-reports
// @desc   Create new activity report
// @access Private (teknisi, sales)
router.post('/', asyncHandler(ActivityReportController.createReport));

// @route  GET /api/activity-reports/:id
// @desc   Get activity report by ID
// @access Private
router.get('/:id', asyncHandler(ActivityReportController.getReportById));

// @route  PUT /api/activity-reports/:id
// @desc   Update activity report
// @access Private (owner, admin, manager)
router.put('/:id', asyncHandler(ActivityReportController.updateReport));

// @route  POST /api/activity-reports/:id/submit
// @desc   Submit report for approval
// @access Private (owner)
router.post('/:id/submit', asyncHandler(ActivityReportController.submitReport));

// @route  POST /api/activity-reports/:id/approval
// @desc   Approve or reject report
// @access Private (admin, manager)
router.post('/:id/approval', asyncHandler(ActivityReportController.approveReport));

// @route  DELETE /api/activity-reports/:id
// @desc   Delete activity report
// @access Private (admin, manager, owner if draft)
router.delete('/:id', asyncHandler(ActivityReportController.deleteReport));

export default router;
