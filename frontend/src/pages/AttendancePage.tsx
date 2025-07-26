import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Timer,
  User,
  BarChart3,
  History
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiService from '@/services/api';

interface Attendance {
  id: number;
  user_id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_location: string | null;
  check_out_location: string | null;
  check_in_notes: string | null;
  check_out_notes: string | null;
  status: 'present' | 'late' | 'absent' | 'half_day';
  work_hours: number | null; // in minutes
  attendance_date: string;
  created_at: string;
  updated_at: string;
}

interface AttendanceStats {
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  half_days: number;
  total_work_hours: number;
  average_work_hours: number;
  attendance_rate: number;
}

const AttendancePage: React.FC = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'stats'>('today');
  const queryClient = useQueryClient();

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Get location name (reverse geocoding)
          fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`)
            .then(response => response.json())
            .then(data => {
              if (data.results && data.results[0]) {
                setLocationName(data.results[0].formatted);
              }
            })
            .catch(() => {
              setLocationName(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationName('Location not available');
        }
      );
    }
  }, []);

  // Fetch today's attendance
  const { data: todayAttendance, isLoading: loadingToday } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => apiService.get('/attendance/today'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch attendance history
  const { data: attendanceHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: () => apiService.get('/attendance/history?limit=20'),
    enabled: activeTab === 'history',
  });

  // Fetch attendance stats
  const { data: attendanceStats, isLoading: loadingStats } = useQuery({
    queryKey: ['attendance', 'stats'],
    queryFn: () => apiService.get('/attendance/stats'),
    enabled: activeTab === 'stats',
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: any) => apiService.post('/attendance/check-in', data),
    onSuccess: () => {
      toast.success('Check-in berhasil!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setNotes('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Check-in gagal');
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (data: any) => apiService.post('/attendance/check-out', data),
    onSuccess: () => {
      toast.success('Check-out berhasil!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setNotes('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Check-out gagal');
    },
  });

  const handleCheckIn = () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }

    checkInMutation.mutate({
      latitude: location.lat,
      longitude: location.lng,
      location: locationName,
      notes: notes.trim() || null,
    });
  };

  const handleCheckOut = () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }

    checkOutMutation.mutate({
      latitude: location.lat,
      longitude: location.lng,
      location: locationName,
      notes: notes.trim() || null,
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'half_day': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Hadir';
      case 'late': return 'Terlambat';
      case 'absent': return 'Tidak Hadir';
      case 'half_day': return 'Setengah Hari';
      default: return status;
    }
  };

  const today = todayAttendance?.data;
  const history = attendanceHistory?.data?.attendance || [];
  const stats: AttendanceStats = attendanceStats?.data || {
    total_days: 0,
    present_days: 0,
    late_days: 0,
    absent_days: 0,
    half_days: 0,
    total_work_hours: 0,
    average_work_hours: 0,
    attendance_rate: 0,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Presensi CloudBit
        </h1>
        <p className="text-gray-600">
          Sistem presensi untuk karyawan CloudBit - Internet Cepat & Stabil
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'today', label: 'Hari Ini', icon: Clock },
            { key: 'history', label: 'Riwayat', icon: History },
            { key: 'stats', label: 'Statistik', icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                ${activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Presensi Hari Ini
              </h2>
              <div className="text-sm text-gray-500">
                {formatDate(new Date().toISOString())}
              </div>
            </div>

            {loadingToday ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Check-in Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${today?.check_in_time ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <CheckCircle className={`w-5 h-5 ${today?.check_in_time ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Check-in</h3>
                      <p className="text-sm text-gray-600">
                        {today?.check_in_time ? formatTime(today.check_in_time) : 'Belum check-in'}
                      </p>
                    </div>
                  </div>

                  {today?.check_in_location && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{today.check_in_location}</span>
                    </div>
                  )}
                </div>

                {/* Check-out Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${today?.check_out_time ? 'bg-red-100' : 'bg-gray-100'}`}>
                      <XCircle className={`w-5 h-5 ${today?.check_out_time ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Check-out</h3>
                      <p className="text-sm text-gray-600">
                        {today?.check_out_time ? formatTime(today.check_out_time) : 'Belum check-out'}
                      </p>
                    </div>
                  </div>

                  {today?.check_out_location && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{today.check_out_location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work Hours & Status */}
            {today && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatDuration(today.work_hours)}
                    </div>
                    <div className="text-sm text-gray-600">Jam Kerja</div>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(today.status)}`}>
                      {getStatusText(today.status)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">
                      <Timer className="w-4 h-4 inline mr-1" />
                      {locationName || 'Getting location...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tambahkan catatan untuk presensi..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending || (today?.check_in_time && !today?.check_out_time)}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {checkInMutation.isPending ? 'Memproses...' : 'Check-in'}
                  </span>
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isPending || !today?.check_in_time || today?.check_out_time}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>
                    {checkOutMutation.isPending ? 'Memproses...' : 'Check-out'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Riwayat Presensi</h2>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam Kerja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((attendance: Attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(attendance.attendance_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(attendance.check_in_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(attendance.check_out_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(attendance.work_hours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                          {getStatusText(attendance.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada riwayat presensi
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Hari</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.total_days}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Hadir</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.present_days}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Terlambat</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.late_days}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tidak Hadir</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.absent_days}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Detail</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.attendance_rate}%
                    </div>
                    <div className="text-sm text-gray-600">Tingkat Kehadiran</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatDuration(stats.total_work_hours)}
                    </div>
                    <div className="text-sm text-gray-600">Total Jam Kerja</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {formatDuration(stats.average_work_hours)}
                    </div>
                    <div className="text-sm text-gray-600">Rata-rata Jam Kerja</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
