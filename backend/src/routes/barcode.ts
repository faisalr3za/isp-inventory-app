import express from 'express';
import { BarcodeController } from '../controllers/barcodeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Generate codes
router.post('/generate/qr/:itemId', BarcodeController.generateQRCode);
router.post('/generate/barcode/:itemId', BarcodeController.generateBarcode);
router.post('/generate-sku', BarcodeController.generateSKU);

// Sticker generation
router.post('/sticker/:itemId', BarcodeController.generateSticker);
router.post('/stickers/batch', BarcodeController.generateBatchStickers);

// Scanning
router.post('/scan', BarcodeController.scanCode);
router.get('/item/:code', BarcodeController.getItemByCode);

// Create inventory from existing barcode
router.post('/create-from-barcode', BarcodeController.createFromBarcode);
router.post('/bulk-import', BarcodeController.bulkImportFromBarcodes);

// File downloads
router.get('/download/:filename', BarcodeController.downloadFile);

export default router;
