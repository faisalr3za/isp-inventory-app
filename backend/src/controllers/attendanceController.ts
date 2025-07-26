import { Request, Response } from 'express';
import { db } from '../config/database';
import { Attendance, AttendanceCreateInput, AttendanceStats } from '../models/Attendance';
import moment from 'moment';

// Get current user's attendance for today
export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const today = moment().format('YYYY-MM-DD');

    const attendance = await db('attendance')
      .where({ user_id: userId, attendance_date: today })
      .first();

    res.json({
      success: true,
      data: attendance || null
    });
  } catch (error) {
    console.error('Error getting today attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today attendance'
    });
  }
};

// Check in
export const checkIn = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const today = moment().format('YYYY-MM-DD');
    const now = new Date();
    
    const {
      latitude,
      longitude,
      location,
      notes
    } = req.body;

    // Check if already checked in today
    const existingAttendance = await db('attendance')
      .where({ user_id: userId, attendance_date: today })
      .first();

    if (existingAttendance && existingAttendance.check_in_time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today'
      });
    }

    // Determine status (late if after 9 AM)
    const checkInTime = moment(now);
    const workStartTime = moment().set({ hour: 9, minute: 0, second: 0 });
    const status = checkInTime.isAfter(workStartTime) ? 'late' : 'present';

    const attendanceData: AttendanceCreateInput = {
      user_id: userId!,
      check_in_time: now,
      check_in_location: location,
      check_in_latitude: latitude,
      check_in_longitude: longitude,
      check_in_notes: notes,
      status,
      attendance_date: today
    };

    let attendance;
    if (existingAttendance) {
      // Update existing record
      await db('attendance')
        .where({ id: existingAttendance.id })
        .update({
          check_in_time: now,
          check_in_location: location,
          check_in_latitude: latitude,
          check_in_longitude: longitude,
          check_in_notes: notes,
          status,
          updated_at: new Date()
        });
      
      attendance = await db('attendance')
        .where({ id: existingAttendance.id })
        .first();
    } else {
      // Create new record
      const [id] = await db('attendance').insert(attendanceData);
      attendance = await db('attendance').where({ id }).first();
    }

    res.json({
      success: true,
      message: 'Check-in successful',
      data: attendance
    });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in'
    });
  }
};

// Check out
export const checkOut = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const today = moment().format('YYYY-MM-DD');
    const now = new Date();
    
    const {
      latitude,
      longitude,
      location,
      notes
    } = req.body;

    // Get today's attendance
    const attendance = await db('attendance')
      .where({ user_id: userId, attendance_date: today })
      .first();

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    if (!attendance.check_in_time) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out'
      });
    }

    // Calculate work hours
    const checkInTime = moment(attendance.check_in_time);
    const checkOutTime = moment(now);
    const workHours = checkOutTime.diff(checkInTime, 'minutes');

    // Update attendance record
    await db('attendance')
      .where({ id: attendance.id })
      .update({
        check_out_time: now,
        check_out_location: location,
        check_out_latitude: latitude,
        check_out_longitude: longitude,
        check_out_notes: notes,
        work_hours: workHours,
        updated_at: new Date()
      });

    const updatedAttendance = await db('attendance')
      .where({ id: attendance.id })
      .first();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: updatedAttendance
    });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out'
    });
  }
};

// Get attendance history
export const getAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      page = 1, 
      limit = 10, 
      start_date, 
      end_date,
      status 
    } = req.query;

    let query = db('attendance')
      .select(
        'attendance.*',
        'users.username',
        'users.full_name',
        'users.email'
      )
      .leftJoin('users', 'attendance.user_id', 'users.id')
      .where('attendance.user_id', userId)
      .orderBy('attendance.attendance_date', 'desc');

    // Apply filters
    if (start_date) {
      query = query.where('attendance.attendance_date', '>=', start_date);
    }
    if (end_date) {
      query = query.where('attendance.attendance_date', '<=', end_date);
    }
    if (status) {
      query = query.where('attendance.status', status);
    }

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.count('* as count').first();
    const totalRecords = parseInt(total?.count as string) || 0;

    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const attendance = await query
      .limit(parseInt(limit as string))
      .offset(offset);

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalRecords,
          pages: Math.ceil(totalRecords / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error getting attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance history'
    });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { start_date, end_date } = req.query;
    
    const startDate = start_date ? moment(start_date as string) : moment().startOf('month');
    const endDate = end_date ? moment(end_date as string) : moment().endOf('month');

    let query = db('attendance')
      .where('user_id', userId)
      .whereBetween('attendance_date', [
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      ]);

    const attendance = await query;
    
    const stats: AttendanceStats = {
      total_days: attendance.length,
      present_days: attendance.filter(a => a.status === 'present').length,
      late_days: attendance.filter(a => a.status === 'late').length,
      absent_days: attendance.filter(a => a.status === 'absent').length,
      half_days: attendance.filter(a => a.status === 'half_day').length,
      total_work_hours: attendance.reduce((sum, a) => sum + (a.work_hours || 0), 0),
      average_work_hours: 0,
      attendance_rate: 0
    };

    stats.average_work_hours = stats.total_days > 0 
      ? Math.round(stats.total_work_hours / stats.total_days) 
      : 0;
    
    const workingDays = stats.present_days + stats.late_days + stats.half_days;
    stats.attendance_rate = stats.total_days > 0 
      ? Math.round((workingDays / stats.total_days) * 100) 
      : 0;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance statistics'
    });
  }
};

// Manager: Get attendance summary
export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? String(date) : moment().format('YYYY-MM-DD');

    // Get total employees count
    const totalEmployees = await db('users').count('* as count').first();
    const total = parseInt(totalEmployees?.count as string) || 0;

    // Get attendance for the specific date
    const attendanceRecords = await db('attendance')
      .where('attendance_date', targetDate);

    const presentToday = attendanceRecords.filter(a => a.status === 'present').length;
    const lateToday = attendanceRecords.filter(a => a.status === 'late').length;
    const absentToday = total - attendanceRecords.length;
    
    // Calculate average work hours
    const totalWorkHours = attendanceRecords.reduce((sum, record) => {
      return sum + (record.work_hours || 0);
    }, 0);
    const averageWorkHours = attendanceRecords.length > 0 
      ? Math.round(totalWorkHours / attendanceRecords.length) 
      : 0;

    // Calculate attendance rate
    const attendanceRate = total > 0 
      ? Math.round(((presentToday + lateToday) / total) * 100) 
      : 0;

    const summary = {
      total_employees: total,
      present_today: presentToday,
      late_today: lateToday,
      absent_today: absentToday,
      average_work_hours: averageWorkHours,
      attendance_rate: attendanceRate
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance summary'
    });
  }
};

// Manager: Get department statistics
export const getDepartmentStats = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? String(date) : moment().format('YYYY-MM-DD');

    // Get department statistics (assuming role as department)
    const departmentStats = await db('users')
      .select('role as department')
      .count('* as total')
      .leftJoin('attendance', function() {
        this.on('users.id', '=', 'attendance.user_id')
            .andOn('attendance.attendance_date', '=', db.raw('?', [targetDate]));
      })
      .select(
        db.raw('COUNT(CASE WHEN attendance.status = \'present\' THEN 1 END) as present'),
        db.raw('COUNT(CASE WHEN attendance.status = \'late\' THEN 1 END) as late'),
        db.raw('COUNT(CASE WHEN attendance.id IS NULL THEN 1 END) as absent')
      )
      .groupBy('users.role');

    const formattedStats = departmentStats.map(dept => {
      const total = parseInt(dept.total as string) || 0;
      const present = parseInt(dept.present as string) || 0;
      const late = parseInt(dept.late as string) || 0;
      const absent = parseInt(dept.absent as string) || 0;
      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      return {
        department: dept.department || 'Unknown',
        total,
        present,
        late,
        absent,
        rate
      };
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error getting department stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get department statistics'
    });
  }
};

// Admin: Get all users attendance
export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      start_date, 
      end_date,
      status,
      user_id 
    } = req.query;

    let query = db('attendance')
      .select(
        'attendance.*',
        'users.username',
        'users.full_name',
        'users.email'
      )
      .leftJoin('users', 'attendance.user_id', 'users.id')
      .orderBy('attendance.attendance_date', 'desc');

    // Apply filters
    if (start_date) {
      query = query.where('attendance.attendance_date', '>=', start_date);
    }
    if (end_date) {
      query = query.where('attendance.attendance_date', '<=', end_date);
    }
    if (status) {
      query = query.where('attendance.status', status);
    }
    if (user_id) {
      query = query.where('attendance.user_id', user_id);
    }

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.count('* as count').first();
    const totalRecords = parseInt(total?.count as string) || 0;

    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const attendance = await query
      .limit(parseInt(limit as string))
      .offset(offset);

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalRecords,
          pages: Math.ceil(totalRecords / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error getting all attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance records'
    });
  }
};
