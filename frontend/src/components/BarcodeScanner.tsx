import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from '@html5-qrcode/html5-qrcode';
import { Camera, X, Flashlight, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  isActive: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, isActive }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  const startScanner = async () => {
    try {
      // Check for camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);

      // Prefer back camera for mobile
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      const cameraId = backCamera ? backCamera.deviceId : videoDevices[0]?.deviceId;
      setSelectedCamera(cameraId);

      // Configure scanner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.7,
        disableFlip: false,
        videoConstraints: {
          deviceId: cameraId,
          facingMode: 'environment'
        }
      };

      scannerRef.current = new Html5QrcodeScanner(
        'barcode-scanner-container',
        config,
        false
      );

      scannerRef.current.render(
        (decodedText: string) => {
          console.log('Scanned:', decodedText);
          onScan(decodedText);
          stopScanner();
        },
        (error: any) => {
          // Ignore error spam - this is normal during scanning
          if (error && !error.includes('No MultiFormat Readers')) {
            console.warn('Scanner error:', error);
          }
        }
      );

      setIsScanning(true);
      
      // Check for flash support
      if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0 && 'getCapabilities' in tracks[0]) {
          const capabilities = tracks[0].getCapabilities();
          setHasFlash('torch' in capabilities);
        }
      }

    } catch (error: any) {
      console.error('Error starting scanner:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.');
      } else {
        toast.error('Failed to start camera scanner.');
      }
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        console.warn('Error stopping scanner:', error);
      }
    }
    setIsScanning(false);
    setFlashEnabled(false);
  };

  const toggleFlash = async () => {
    if (!hasFlash) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera }
      });
      const track = stream.getVideoTracks()[0];
      
      if ('applyConstraints' in track) {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled }] as any
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (error) {
      console.error('Error toggling flash:', error);
      toast.error('Flash not available on this device.');
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;

    const currentIndex = cameras.findIndex(cam => cam.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    setSelectedCamera(nextCamera.deviceId);
    stopScanner();
    setTimeout(startScanner, 100);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold">Scan Barcode/QR Code</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Scanner */}
          <div 
            id="barcode-scanner-container" 
            className="scanner-viewfinder mx-auto"
          />
          
          {/* Overlay with targeting guide */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="scanner-overlay" />
              <div className="scanner-target">
                <div className="scanner-corners" />
                <div className="scanner-bottom-corners" />
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-white">
          <div className="flex items-center justify-center mb-2">
            <Camera className="mr-2" size={20} />
            <span className="text-sm">Position barcode/QR code in the frame</span>
          </div>
          <p className="text-xs text-gray-300">
            Make sure the code is well-lit and clearly visible
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 p-6 bg-gray-900">
        {/* Flash Toggle */}
        {hasFlash && (
          <button
            onClick={toggleFlash}
            className={`p-3 rounded-full transition-colors ${
              flashEnabled 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <Flashlight size={24} />
          </button>
        )}

        {/* Camera Switch */}
        {cameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        )}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Status Indicator */}
      {isScanning && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Scanning...
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
