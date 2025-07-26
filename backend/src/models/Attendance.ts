export interface Attendance {
  id: number;
  user_id: number;
  check_in_time: Date | null;
  check_out_time: Date | null;
  check_in_location: string | null;
  check_out_location: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  check_in_notes: string | null;
  check_out_notes: string | null;
  status: 'present' | 'late' | 'absent' | 'half_day';
  work_hours: number | null; // in minutes
  attendance_date: string; // YYYY-MM-DD format
  created_at: Date;
  updated_at: Date;
  
  // Relations
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
}

export interface AttendanceCreateInput {
  user_id: number;
  check_in_time?: Date;
  check_out_time?: Date;
  check_in_location?: string;
  check_out_location?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  check_in_notes?: string;
  check_out_notes?: string;
  status?: 'present' | 'late' | 'absent' | 'half_day';
  attendance_date: string;
}

export interface AttendanceUpdateInput {
  check_in_time?: Date;
  check_out_time?: Date;
  check_in_location?: string;
  check_out_location?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  check_in_notes?: string;
  check_out_notes?: string;
  status?: 'present' | 'late' | 'absent' | 'half_day';
  work_hours?: number;
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  half_days: number;
  total_work_hours: number;
  average_work_hours: number;
  attendance_rate: number;
}
