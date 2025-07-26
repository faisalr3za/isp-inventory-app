import { Request, Response } from 'express';
import { BarcodeService, BarcodeData } from '../services/barcodeService';
import { InventoryItemModel } from '../models/InventoryItem';
import asyncHandler from '../middleware/asyncHandler';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    username: string;
  };
}

export class BarcodeController {
  
  // @desc    Generate QR Code untuk inventory item
  // @route   POST /api/barcode/generate/qr/:itemId
  // @access  Private
  static generateQRCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { itemId } = req.params;
    
const item = await InventoryItemModel.findById(parseInt(itemId));
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan'
      });
    }

    // Jika item sudah memiliki barcode, tidak perlu generate QR code lagi
    if (item.barcode) {
      return res.status(200).json({
        success: true,
        message: 'Item sudah memiliki barcode',
        data: {
          barcode: item.barcode,
          barcode_path: item.barcode_path,
          item_info: {
            id: item.id,
            nama_barang: item.nama_barang,
            sku: item.sku
          }
        }
      });
    }

    const barcodeData: BarcodeData = {
      id: BarcodeService.generateSKU(),
      type: 'qrcode',
      data: {
        item_id: item.id!,
        nama_barang: item.nama_barang,
        sku: item.sku,
        kategori: item.kategori_nama,
        lokasi_gudang: item.lokasi_gudang,
        created_at: new Date()
      }
    };

    const qrBuffer = await BarcodeService.generateQRCode(barcodeData);
    const filename = `qr_${item.id}_${Date.now()}.png`;
    const filePath = await BarcodeService.saveCodeImage(qrBuffer, filename);

    // Update item dengan QR code info
    await InventoryItemModel.update(item.id!, {
      qr_code: barcodeData.id,
      qr_code_path: filePath
    });

    res.json({
      success: true,
      message: 'QR Code berhasil dibuat',
      data: {
        qr_code: barcodeData.id,
        image_path: filePath,
        item_info: {
          id: item.id,
          nama_barang: item.nama_barang,
          sku: item.sku
        }
      }
    });
  });

  // @desc    Generate Barcode untuk inventory item
  // @route   POST /api/barcode/generate/barcode/:itemId
  // @access  Private
  static generateBarcode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { itemId } = req.params;
    const { format = 'CODE128' } = req.body;
    
    const item = await InventoryItemModel.findById(parseInt(itemId));
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan'
      });
    }

    const barcodeData: BarcodeData = {
      id: item.sku || BarcodeService.generateSKU(),
      type: 'barcode',
      format: format as any,
      data: {
        item_id: item.id!,
        nama_barang: item.nama_barang,
        sku: item.sku,
        kategori: item.kategori_nama,
        lokasi_gudang: item.lokasi_gudang,
        created_at: new Date()
      }
    };

    const barcodeBuffer = await BarcodeService.generateBarcode(barcodeData);
    const filename = `barcode_${item.id}_${Date.now()}.png`;
    const filePath = await BarcodeService.saveCodeImage(barcodeBuffer, filename);

    // Update item dengan barcode info
    await InventoryItemModel.update(item.id!, {
      barcode: barcodeData.id,
      barcode_path: filePath
    });

    res.json({
      success: true,
      message: 'Barcode berhasil dibuat',
      data: {
        barcode: barcodeData.id,
        format: format,
        image_path: filePath,
        item_info: {
          id: item.id,
          nama_barang: item.nama_barang,
          sku: item.sku
        }
      }
    });
  });

  // @desc    Generate single sticker untuk item
  // @route   POST /api/barcode/sticker/:itemId
  // @access  Private
  static generateSticker = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { itemId } = req.params;
    const { width, height, fontSize, includeText } = req.body;
    
    const item = await InventoryItemModel.findById(parseInt(itemId));
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan'
      });
    }

    const barcodeData: BarcodeData = {
      id: item.qr_code || BarcodeService.generateSKU(),
      type: 'qrcode',
      data: {
        item_id: item.id!,
        nama_barang: item.nama_barang,
        sku: item.sku,
        kategori: item.kategori_nama,
        lokasi_gudang: item.lokasi_gudang,
        created_at: new Date()
      }
    };

    const stickerOptions = {
      width: width || 250,
      height: height || 150,
      fontSize: fontSize || 10,
      includeText: includeText !== false
    };

    const stickerBuffer = await BarcodeService.generateSticker(barcodeData, stickerOptions);
    const filename = `sticker_${item.id}_${Date.now()}.png`;
    const filePath = await BarcodeService.saveCodeImage(stickerBuffer, filename, 'stickers');

    res.json({
      success: true,
      message: 'Sticker berhasil dibuat',
      data: {
        sticker_path: filePath,
        item_info: {
          id: item.id,
          nama_barang: item.nama_barang,
          sku: item.sku
        },
        options: stickerOptions
      }
    });
  });

  // @desc    Generate batch stickers untuk multiple items (PDF)
  // @route   POST /api/barcode/stickers/batch
  // @access  Private
  static generateBatchStickers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { itemIds, options = {} } = req.body;
    
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Item IDs diperlukan dan harus berupa array'
      });
    }

    const items = await Promise.all(
      itemIds.map((id: number) => InventoryItemModel.findById(id))
    );

    const validItems = items.filter(item => item !== null);
    
    if (validItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada item yang valid ditemukan'
      });
    }

    const barcodeDataArray = await BarcodeService.generateBatchCodes(validItems);
    const pdfBuffer = await BarcodeService.generateStickerPDF(barcodeDataArray, options);
    
    const filename = `batch_stickers_${Date.now()}.pdf`;
    const uploadsDir = 'uploads/stickers';
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);

    res.json({
      success: true,
      message: `Batch stickers berhasil dibuat untuk ${validItems.length} item`,
      data: {
        pdf_path: `/uploads/stickers/${filename}`,
        items_count: validItems.length,
        items: validItems.map(item => ({
          id: item.id,
          nama_barang: item.nama_barang,
          sku: item.sku
        }))
      }
    });
  });

  // @desc    Scan barcode/QR code
  // @route   POST /api/barcode/scan
  // @access  Private
  static scanCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { scannedData, action = 'lookup' } = req.body;
    
    if (!scannedData) {
      return res.status(400).json({
        success: false,
        message: 'Data scan diperlukan'
      });
    }

    const parsedData = BarcodeService.parseScannedData(scannedData);
    let item = null;

    try {
      if (parsedData.type === 'qrcode' && parsedData.data.item_id) {
        // QR Code scan
        item = await InventoryItemModel.findById(parsedData.data.item_id);
      } else if (parsedData.type === 'barcode' || parsedData.type === 'unknown') {
        // Barcode scan - search by SKU or barcode
        const searchTerm = parsedData.data.sku || parsedData.data.scanned_code || parsedData.data.raw;
        const items = await InventoryItemModel.findAll({ search: searchTerm, limit: 1 });
        item = items.items.length > 0 ? items.items[0] : null;
        
        // If not found by search, try exact match on SKU or barcode fields
        if (!item) {
          // This would require adding a method to search by exact barcode/sku
          // For now, we'll use the existing search
        }
      }

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item tidak ditemukan dengan code yang discan',
          scanned_info: {
            type: parsedData.type,
            raw_data: scannedData,
            parsed_data: parsedData.data
          }
        });
      }

      // Process different actions
      let actionResult = {};
      
      switch (action) {
        case 'stock_in':
          actionResult = {
            action: 'stock_in',
            message: 'Siap untuk stock in',
            next_step: 'Input jumlah barang masuk'
          };
          break;
          
        case 'stock_out':
          actionResult = {
            action: 'stock_out',
            message: 'Siap untuk stock out',
            next_step: 'Input jumlah barang keluar',
            current_stock: item.stok
          };
          break;
          
        case 'lookup':
        default:
          actionResult = {
            action: 'lookup',
            message: 'Item ditemukan'
          };
      }

      res.json({
        success: true,
        message: 'Scan berhasil',
        data: {
          item: {
            id: item.id,
            nama_barang: item.nama_barang,
            sku: item.sku,
            stok: item.stok,
            kategori: item.kategori_nama,
            lokasi_gudang: item.lokasi_gudang,
            harga_beli: item.harga_beli,
            harga_jual: item.harga_jual
          },
          scan_info: {
            type: parsedData.type,
            scanned_at: new Date(),
            scanned_by: req.user?.id
          },
          ...actionResult
        }
      });

    } catch (error) {
      console.error('Error processing scan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memproses scan',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // @desc    Get item info by barcode/QR code
  // @route   GET /api/barcode/item/:code
  // @access  Private
  static getItemByCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { code } = req.params;
    
    // Try to find item by QR code first
    let items = await InventoryItemModel.findAll({ search: code, limit: 5 });
    
    if (items.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan dengan kode tersebut'
      });
    }

    res.json({
      success: true,
      data: {
        items: items.items.map(item => ({
          id: item.id,
          nama_barang: item.nama_barang,
          sku: item.sku,
          stok: item.stok,
          kategori: item.kategori_nama,
          lokasi_gudang: item.lokasi_gudang,
          qr_code: item.qr_code,
          barcode: item.barcode
        })),
        search_term: code
      }
    });
  });

  // @desc    Generate SKU for new item
  // @route   POST /api/barcode/generate-sku
  // @access  Private
  static generateSKU = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { prefix, kategori } = req.body;
    
    let skuPrefix = 'INV';
    
    if (prefix) {
      skuPrefix = prefix;
    } else if (kategori) {
      // Generate prefix from category name
      skuPrefix = kategori.substring(0, 3).toUpperCase();
    }
    
    const sku = BarcodeService.generateSKU(skuPrefix);
    
    res.json({
      success: true,
      data: {
        sku: sku,
        prefix: skuPrefix,
        generated_at: new Date()
      }
    });
  });

  // @desc    Create inventory item from existing barcode/serial number
  // @route   POST /api/barcode/create-from-barcode
  // @access  Private (admin, manager)
  static createFromBarcode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      barcode,
      serial_number,
      nama_barang,
      kategori_id,
      supplier_id,
      harga_beli,
      harga_jual,
      stok,
      lokasi_gudang,
      deskripsi,
      brand,
      model
    } = req.body;

    // Check permission
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan manager yang dapat membuat item dari barcode.'
      });
    }

    // Validate required fields
    if (!barcode && !serial_number) {
      return res.status(400).json({
        success: false,
        message: 'Barcode atau serial number harus diisi'
      });
    }

    if (!nama_barang || !kategori_id) {
      return res.status(400).json({
        success: false,
        message: 'Nama barang dan kategori wajib diisi'
      });
    }

    try {
      // Check if barcode/serial already exists
      const existingItems = await InventoryItemModel.findAll({ 
        search: barcode || serial_number, 
        limit: 1 
      });
      
      if (existingItems.items.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Barcode/Serial number sudah ada dalam sistem',
          existing_item: {
            id: existingItems.items[0].id,
            nama_barang: existingItems.items[0].nama_barang,
            sku: existingItems.items[0].sku
          }
        });
      }

      // Generate SKU if not provided
      const sku = BarcodeService.generateSKU();

      // Create inventory item
      const itemData = {
        sku,
        nama_barang,
        deskripsi: deskripsi || '',
        kategori_id,
        supplier_id: supplier_id || null,
        brand: brand || '',
        model: model || '',
        harga_beli: harga_beli || 0,
        harga_jual: harga_jual || 0,
        stok: stok || 0,
        lokasi_gudang: lokasi_gudang || '',
        barcode: barcode || null,
        serial_number: serial_number || null,
        kondisi: 'new',
        status: 'active'
      };

      const newItem = await InventoryItemModel.create(itemData);

      res.status(201).json({
        success: true,
        message: 'Item berhasil dibuat dari barcode/serial number',
        data: {
          item: {
            id: newItem.id,
            sku: newItem.sku,
            nama_barang: newItem.nama_barang,
            barcode: newItem.barcode,
            serial_number: newItem.serial_number,
            stok: newItem.stok
          },
          info: {
            created_from: barcode ? 'barcode' : 'serial_number',
            original_code: barcode || serial_number,
            generated_sku: sku
          }
        }
      });

    } catch (error) {
      console.error('Error creating item from barcode:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat item dari barcode'
      });
    }
  });

  // @desc    Bulk import items from barcode list
  // @route   POST /api/barcode/bulk-import
  // @access  Private (admin, manager)
  static bulkImportFromBarcodes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { items, default_category_id, default_supplier_id } = req.body;

    // Check permission
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan manager yang dapat bulk import.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array diperlukan'
      });
    }

    try {
      const results = {
        success: [],
        errors: [],
        skipped: []
      };

      for (const [index, item] of items.entries()) {
        try {
          const { barcode, serial_number, nama_barang, kategori_id, ...otherData } = item;

          // Skip if no barcode/serial
          if (!barcode && !serial_number) {
            results.skipped.push({
              index,
              reason: 'No barcode or serial number',
              item
            });
            continue;
          }

          // Skip if no name
          if (!nama_barang) {
            results.skipped.push({
              index,
              reason: 'No item name',
              item
            });
            continue;
          }

          // Check if already exists
          const existingItems = await InventoryItemModel.findAll({ 
            search: barcode || serial_number, 
            limit: 1 
          });
          
          if (existingItems.items.length > 0) {
            results.skipped.push({
              index,
              reason: 'Already exists',
              existing_item: existingItems.items[0],
              item
            });
            continue;
          }

          // Create item
          const sku = BarcodeService.generateSKU();
          const itemData = {
            sku,
            nama_barang,
            kategori_id: kategori_id || default_category_id,
            supplier_id: default_supplier_id,
            barcode: barcode || null,
            serial_number: serial_number || null,
            kondisi: 'new',
            status: 'active',
            ...otherData
          };

          const newItem = await InventoryItemModel.create(itemData);
          results.success.push({
            index,
            item: {
              id: newItem.id,
              sku: newItem.sku,
              nama_barang: newItem.nama_barang,
              barcode: newItem.barcode,
              serial_number: newItem.serial_number
            }
          });

        } catch (error) {
          results.errors.push({
            index,
            error: error.message,
            item
          });
        }
      }

      res.json({
        success: true,
        message: `Bulk import selesai. ${results.success.length} berhasil, ${results.errors.length} error, ${results.skipped.length} dilewati`,
        data: results
      });

    } catch (error) {
      console.error('Error bulk importing from barcodes:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat bulk import'
      });
    }
  });

  // @desc    Download sticker/barcode file
  // @route   GET /api/barcode/download/:filename
  // @access  Private
  static downloadFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { filename } = req.params;
    const { type = 'stickers' } = req.query;
    
    const path = require('path');
    const fs = require('fs');
    
    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    const fileExt = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExt) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
}
