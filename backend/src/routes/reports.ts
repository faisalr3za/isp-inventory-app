import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import { ReportController } from '../controllers/reportController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Stock Opname Reports
router.get('/stock-opname', asyncHandler(ReportController.getStockOpnameReport));
router.get('/stock-opname/export-csv', asyncHandler(ReportController.exportStockOpnameToCSV));

// Stock Variance Reports (for discrepancy tracking)
router.get('/stock-variance', asyncHandler(ReportController.getStockVarianceReport));
router.post('/calculate-variance', asyncHandler(ReportController.calculateStockVariance));

// Movement Reports
router.get('/monthly-movements', asyncHandler(ReportController.getMonthlyMovementReport));

// Analytics Dashboard
router.get('/analytics', asyncHandler(ReportController.getAnalyticsDashboard));

// Stock Aging Report
router.get('/stock-aging', asyncHandler(ReportController.getStockAgingReport));

// Legacy inventory endpoint (kept for compatibility)
router.get('/inventory', asyncHandler(async (req, res) => {
  // Redirect to stock opname report
  const result = await ReportController.getStockOpnameReport(req as any, res);
  return result;
}));

export default router;
