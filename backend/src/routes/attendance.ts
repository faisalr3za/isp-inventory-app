import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getTodayAttendance,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getAttendanceStats,
  getAttendanceSummary,
  getDepartmentStats,
  getAllAttendance
} from '../controllers/attendanceController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User attendance routes
router.get('/today', getTodayAttendance);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/history', getAttendanceHistory);
router.get('/stats', getAttendanceStats);

// Manager routes (requires manager or admin role)
router.get('/manager/summary', getAttendanceSummary);
router.get('/manager/departments', getDepartmentStats);

// Admin routes (requires admin role)
router.get('/all', getAllAttendance);

export default router;
