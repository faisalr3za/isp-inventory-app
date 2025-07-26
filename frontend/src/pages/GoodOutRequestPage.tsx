import React, { useState } from 'react';
import { Scan, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import apiService from '@/services/api';
import toast from 'react-hot-toast';

interface GoodOutRequestPageProps {
  user?: any;
}

const GoodOutRequestPage: React.FC<GoodOutRequestPageProps> = ({ user }) => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedItem, setScannedItem] = useState<any>(null);
  const [usageDescription, setUsageDescription] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [showMyRequests, setShowMyRequests] = useState(false);

  const handleScan = async (code: string) => {
    try {
      // Use the scan endpoint to identify the item
      const response = await apiService.post('/api/barcode/scan', {
        scannedData: code,
        action: 'lookup'
      });

      if (response.data.success && response.data.data.item) {
        setScannedItem(response.data.data.item);
        toast.success(`Item ditemukan: ${response.data.data.item.nama_barang}`);
      } else {
        toast.error('Item tidak ditemukan');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.response?.data?.message || 'Error saat scan barcode');
    } finally {
      setIsScannerActive(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!scannedItem || !usageDescription.trim()) {
      toast.error('Harap lengkapi semua field yang diperlukan');
      return;
    }

    if (scannedItem.stok < quantity) {
      toast.error(`Stok tidak mencukupi. Tersedia: ${scannedItem.stok}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.post('/api/good-out-requests', {
        item_id: scannedItem.id,
        quantity: quantity,
        usage_description: usageDescription,
        customer_location: customerLocation || undefined
      });

      if (response.data.success) {
        toast.success('Permintaan good out berhasil dibuat dan menunggu persetujuan');
        
        // Reset form
        setScannedItem(null);
        setUsageDescription('');
        setCustomerLocation('');
        setQuantity(1);
        
        // Refresh requests if showing
        if (showMyRequests) {
          fetchMyRequests();
        }
      } else {
        toast.error(response.data.message || 'Gagal membuat permintaan');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Error saat submit permintaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await apiService.get('/api/good-out-requests?my_requests=true');
      if (response.data.success) {
        setRequests(response.data.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Gagal memuat daftar permintaan');
    }
  };

  React.useEffect(() => {
    if (showMyRequests) {
      fetchMyRequests();
    }
  }, [showMyRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Permintaan Good Out</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Selamat datang, {user?.nama_lengkap || 'Teknisi'}</span>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setShowMyRequests(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showMyRequests
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Buat Permintaan
          </button>
          <button
            onClick={() => setShowMyRequests(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showMyRequests
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Permintaan Saya
          </button>
        </div>
      </div>

      {!showMyRequests ? (
        <>
          {/* Scan Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Scan Barcode Item</h2>
            
            <button
              onClick={() => setIsScannerActive(true)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Scan className="mr-3" size={24} />
              {isSubmitting ? 'Processing...' : 'Scan Barcode Item'}
            </button>
          </div>

          {/* Scanned Item Info */}
          {scannedItem && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Package className="mr-3 text-primary-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{scannedItem.nama_barang}</h3>
                    <p className="text-sm text-gray-600">SKU: {scannedItem.sku}</p>
                  </div>
                </div>
                <button
                  onClick={() => setScannedItem(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Stok Tersedia</span>
                  <p className={`text-lg font-semibold ${
                    scannedItem.stok <= 0 
                      ? 'text-red-600' 
                      : scannedItem.stok <= 5
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    {scannedItem.stok}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Lokasi</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {scannedItem.lokasi_gudang || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Request Form */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">2. Detail Permintaan</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Jumlah *</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      max={scannedItem.stok}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Keterangan Penggunaan *</label>
                    <input
                      type="text"
                      value={usageDescription}
                      onChange={(e) => setUsageDescription(e.target.value)}
                      placeholder="Contoh: Pemasangan internet pelanggan baru"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Lokasi Pelanggan (opsional)</label>
                    <input
                      type="text"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting || !usageDescription.trim() || scannedItem.stok < quantity}
                  className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mengirim Permintaan...' : 'Kirim Permintaan Good Out'}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* My Requests Section */
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Permintaan Saya</h2>
          
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada permintaan good out</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.item?.nama_barang}</h3>
                      <p className="text-sm text-gray-600">SKU: {request.item?.sku}</p>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Jumlah:</span>
                      <span className="ml-2 font-medium">{request.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>
                      <span className="ml-2 font-medium">
                        {new Date(request.requested_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-gray-500 text-sm">Keterangan:</span>
                    <p className="text-sm mt-1">{request.reason}</p>
                  </div>

                  {request.notes && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-sm">Lokasi:</span>
                      <p className="text-sm mt-1">{request.notes}</p>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <span className="text-red-700 text-sm font-medium">Alasan Penolakan:</span>
                      <p className="text-red-600 text-sm mt-1">{request.rejection_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isActive={isScannerActive}
        onScan={handleScan}
        onClose={() => setIsScannerActive(false)}
      />
    </div>
  );
};

export default GoodOutRequestPage;
