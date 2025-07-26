import React, { useState } from 'react';
import { Scan, Package, ArrowUp, ArrowDown, History, QrCode } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import apiService from '@/services/api';
import toast from 'react-hot-toast';
import { InventoryItem, InventoryMovement } from '@/types';

interface ScanPageProps {
  user?: any;
}

const ScanPage: React.FC<ScanPageProps> = ({ user }) => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scanMode, setScanMode] = useState<'lookup' | 'in' | 'out'>('lookup');
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [lastMovement, setLastMovement] = useState<InventoryMovement | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (code: string) => {
    setIsProcessing(true);
    try {
      if (scanMode === 'lookup') {
        // Just lookup the item
        const response = await apiService.getItemByCode(code);
        if (response.success && response.data) {
          setScannedItem(response.data);
          toast.success(`Found: ${response.data.name}`);
        } else {
          toast.error('Item not found');
        }
      } else {
        // Process inventory movement
        const response = await apiService.scanCode(code, scanMode);
        if (response.success && response.data) {
          setScannedItem(response.data.item);
          setLastMovement(response.data.movement);
          
          const action = scanMode === 'in' ? 'added to' : 'removed from';
          toast.success(
            `${quantity} ${response.data.item.name} ${action} inventory`
          );
        } else {
          toast.error(response.message || 'Failed to process scan');
        }
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.response?.data?.message || 'Error processing scan');
    } finally {
      setIsProcessing(false);
      setIsScannerActive(false);
    }
  };

  const handleManualMovement = async () => {
    if (!scannedItem || !quantity || scanMode === 'lookup') return;

    setIsProcessing(true);
    try {
      const response = await apiService.createMovement({
        item_id: scannedItem.id,
        movement_type: scanMode,
        quantity: scanMode === 'out' ? -quantity : quantity,
        notes: notes || undefined
      });

      if (response.success) {
        setLastMovement(response.data);
        const action = scanMode === 'in' ? 'added to' : 'removed from';
        toast.success(`${quantity} ${scannedItem.name} ${action} inventory`);
        
        // Update local item quantity
        setScannedItem(prev => prev ? {
          ...prev,
          quantity: scanMode === 'in' 
            ? prev.quantity + quantity 
            : prev.quantity - quantity
        } : null);
      } else {
        toast.error('Failed to record movement');
      }
    } catch (error: any) {
      console.error('Movement error:', error);
      toast.error(error.response?.data?.message || 'Error recording movement');
    } finally {
      setIsProcessing(false);
      setNotes('');
    }
  };

  const resetScan = () => {
    setScannedItem(null);
    setLastMovement(null);
    setQuantity(1);
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Scanner</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Welcome, {user?.first_name || 'User'}</span>
          </div>
        </div>

        {/* Scan Mode Selector */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setScanMode('lookup')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              scanMode === 'lookup'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <QrCode className="mr-2" size={18} />
            Lookup
          </button>
          <button
            onClick={() => setScanMode('in')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              scanMode === 'in'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowUp className="mr-2" size={18} />
            Stock In
          </button>
          <button
            onClick={() => setScanMode('out')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              scanMode === 'out'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowDown className="mr-2" size={18} />
            Stock Out
          </button>
        </div>

        {/* Start Scan Button */}
        <button
          onClick={() => setIsScannerActive(true)}
          disabled={isProcessing}
          className="w-full flex items-center justify-center px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Scan className="mr-3" size={24} />
          {isProcessing ? 'Processing...' : 'Start Scanning'}
        </button>
      </div>

      {/* Scanned Item Info */}
      {scannedItem && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Package className="mr-3 text-primary-600" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{scannedItem.name}</h3>
                <p className="text-sm text-gray-600">SKU: {scannedItem.sku}</p>
              </div>
            </div>
            <button
              onClick={resetScan}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Item Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Current Stock</span>
              <p className={`text-lg font-semibold ${
                scannedItem.quantity <= scannedItem.minimum_stock 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {scannedItem.quantity}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location</span>
              <p className="text-lg font-semibold text-gray-900">
                {scannedItem.location || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Cost Price</span>
              <p className="text-lg font-semibold text-gray-900">
                ${scannedItem.cost_price.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Selling Price</span>
              <p className="text-lg font-semibold text-gray-900">
                ${scannedItem.selling_price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Low Stock Warning */}
          {scannedItem.quantity <= scannedItem.minimum_stock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">
                ⚠️ Low stock alert! Current: {scannedItem.quantity}, Minimum: {scannedItem.minimum_stock}
              </p>
            </div>
          )}

          {/* Manual Movement Controls */}
          {scanMode !== 'lookup' && (
            <div className="border-t pt-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Record Movement</h4>
              
              <div className="flex items-center space-x-4 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this movement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleManualMovement}
                disabled={isProcessing || !quantity}
                className={`w-full px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  scanMode === 'in'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isProcessing ? 'Processing...' : `Record ${scanMode === 'in' ? 'Stock In' : 'Stock Out'}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Last Movement */}
      {lastMovement && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-3">
            <History className="mr-2 text-gray-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Last Movement</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                lastMovement.movement_type === 'in' 
                  ? 'bg-green-100 text-green-800'
                  : lastMovement.movement_type === 'out'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {lastMovement.movement_type.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                {new Date(lastMovement.created_at).toLocaleString()}
              </span>
            </div>
            
            <p className="text-sm text-gray-700">
              Quantity: {Math.abs(lastMovement.quantity)}
            </p>
            
            {lastMovement.notes && (
              <p className="text-sm text-gray-600 mt-1">
                Notes: {lastMovement.notes}
              </p>
            )}
          </div>
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

export default ScanPage;
