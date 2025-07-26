import React, { useState, useEffect } from 'react';
import { Bell, Package, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Only show for admin and manager
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return null;
  }

  useEffect(() => {
    fetchPendingCount();
    // Set up polling for real-time updates
    const interval = setInterval(fetchPendingCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await apiService.get('/api/good-out-requests/pending/count');
      if (response.data.success) {
        setPendingCount(response.data.data.pending_count);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const fetchRecentRequests = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await apiService.get('/api/good-out-requests?status=pending&limit=5');
      if (response.data.success) {
        setRecentRequests(response.data.data.requests);
      }
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && pendingCount > 0) {
      fetchRecentRequests();
    }
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors"
      >
        <Bell className={`w-5 h-5 ${pendingCount > 0 ? 'text-yellow-500' : ''}`} />
        {pendingCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={closeDropdown}></div>
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Good Out Requests
                </h3>
                {pendingCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {pendingCount} pending
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : pendingCount === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending requests</p>
                  <p className="text-xs text-gray-400">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-yellow-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {request.item?.nama_barang}
                            </p>
                            <span className="text-xs text-gray-500">
                              {request.quantity} pcs
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-1">
                            Teknisi: {request.requester?.nama_lengkap}
                          </p>
                          
                          <p className="text-xs text-gray-500 truncate">
                            {request.reason}
                          </p>
                          
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(request.requested_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pendingCount > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <Link
                  to="/good-out-approval"
                  onClick={closeDropdown}
                  className="block w-full text-center py-2 px-4 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  View All Requests ({pendingCount})
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
