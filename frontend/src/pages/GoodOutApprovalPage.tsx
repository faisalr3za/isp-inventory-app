import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Package, User, Calendar, MapPin, AlertCircle, Eye } from 'lucide-react';
import apiService from '@/services/api';
import toast from 'react-hot-toast';

interface GoodOutApprovalPageProps {
  user?: any;
}

const GoodOutApprovalPage: React.FC<GoodOutApprovalPageProps> = ({ user }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [selectedStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/api/good-out-requests?status=${selectedStatus}&limit=20`);
      if (response.data.success) {
        setRequests(response.data.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Gagal memuat daftar permintaan');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get counts for each status
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        apiService.get('/api/good-out-requests?status=pending&limit=1'),
        apiService.get('/api/good-out-requests?status=approved&limit=1'),
        apiService.get('/api/good-out-requests?status=rejected&limit=1')
      ]);

      setStats({
        pending: pendingRes.data.data.total || 0,
        approved: approvedRes.data.data.total || 0,
        rejected: rejectedRes.data.data.total || 0,
        total: (pendingRes.data.data.total || 0) + (approvedRes.data.data.total || 0) + (rejectedRes.data.data.total || 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (requestId: number) => {
    if (processingId) return;
    
    setProcessingId(requestId);
    try {
      const response = await apiService.put(`/api/good-out-requests/${requestId}/approve`);
      if (response.data.success) {
        toast.success('Permintaan berhasil disetujui');
        fetchRequests();
        fetchStats();
      } else {
        toast.error(response.data.message || 'Gagal menyetujui permintaan');
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Error saat menyetujui permintaan');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number, reason: string) => {
    if (processingId) return;
    
    setProcessingId(requestId);
    try {
      const response = await apiService.put(`/api/good-out-requests/${requestId}/reject`, {
        rejection_reason: reason
      });
      if (response.data.success) {
        toast.success('Permintaan berhasil ditolak');
        fetchRequests();
        fetchStats();
        setShowModal(false);
        setRejectionReason('');
        setSelectedRequest(null);
      } else {
        toast.error(response.data.message || 'Gagal menolak permintaan');
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Error saat menolak permintaan');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (request: any) => {
    setSelectedRequest(request);
    setShowModal(true);
    setRejectionReason('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'approved': return 'text-green-600 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const statusTabs = [
    { key: 'pending', label: 'Menunggu', count: stats.pending, color: 'text-yellow-600' },
    { key: 'approved', label: 'Disetujui', count: stats.approved, color: 'text-green-600' },
    { key: 'rejected', label: 'Ditolak', count: stats.rejected, color: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Good Out</h1>
            <p className="text-gray-600 mt-1">Kelola permintaan pengambilan barang dari teknisi</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Permintaan</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-colors relative ${
                selectedStatus === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedStatus === tab.key
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-white text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.key === 'pending' && tab.count > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat permintaan...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>Tidak ada permintaan {statusTabs.find(t => t.key === selectedStatus)?.label.toLowerCase()}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Package className="text-primary-600" size={20} />
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.item?.nama_barang}</h3>
                          <p className="text-sm text-gray-600">SKU: {request.item?.sku}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User size={16} className="mr-2" />
                        <div>
                          <span className="font-medium">Teknisi:</span>
                          <br />
                          <span>{request.requester?.nama_lengkap}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <div>
                          <span className="font-medium">Tanggal:</span>
                          <br />
                          <span>{new Date(request.requested_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Package size={16} className="mr-2" />
                        <div>
                          <span className="font-medium">Jumlah:</span>
                          <br />
                          <span className="font-bold">{request.quantity} unit</span>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 font-medium mb-1">Keterangan Penggunaan:</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                    </div>

                    {/* Location */}
                    {request.notes && (
                      <div className="mb-4">
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin size={16} className="mr-2 mt-0.5" />
                          <div>
                            <span className="font-medium">Lokasi:</span>
                            <br />
                            <span>{request.notes}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stock Info */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700 font-medium">Stok Tersedia:</span>
                        <span className={`font-bold ${
                          request.item?.stok >= request.quantity 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {request.item?.stok} unit
                        </span>
                      </div>
                      {request.item?.stok < request.quantity && (
                        <p className="text-red-600 text-xs mt-1">
                          ⚠️ Stok tidak mencukupi untuk permintaan ini
                        </p>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-medium">Alasan Penolakan:</p>
                        <p className="text-red-600 text-sm mt-1">{request.rejection_reason}</p>
                      </div>
                    )}

                    {/* Approval Info */}
                    {(request.status === 'approved' || request.status === 'rejected') && request.approver && (
                      <div className="mb-4 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">
                            {request.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh:
                          </span>
                          {' '}{request.approver.nama_lengkap}
                          {' '}pada {new Date(request.approved_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openRejectModal(request)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={16} className="inline mr-2" />
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id || request.item?.stok < request.quantity}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request.id ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline mr-2"></div>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="inline mr-2" />
                          Setujui
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <XCircle className="text-red-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Tolak Permintaan</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Anda akan menolak permintaan untuk item:
              </p>
              <p className="font-medium text-gray-900">{selectedRequest.item?.nama_barang}</p>
              <p className="text-sm text-gray-600">Teknisi: {selectedRequest.requester?.nama_lengkap}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Penolakan *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Berikan alasan penolakan yang jelas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id, rejectionReason)}
                disabled={!rejectionReason.trim() || processingId === selectedRequest.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedRequest.id ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  'Tolak Permintaan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodOutApprovalPage;
