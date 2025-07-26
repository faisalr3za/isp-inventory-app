import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { getFileUrl, s3Upload } from '../config/s3';

export interface BarcodeData {
  id: string;
  type: 'qrcode' | 'barcode';
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
  data: {
    item_id: number;
    nama_barang: string;
    sku?: string;
    kategori?: string;
    lokasi_gudang?: string;
    created_at: Date;
  };
}

export interface StickerOptions {
  width: number;
  height: number;
  fontSize: number;
  includeText: boolean;
  itemsPerRow: number;
  itemsPerPage: number;
}

export class BarcodeService {
  
  // Generate unique barcode/SKU
  static generateSKU(categoryPrefix: string = 'INV'): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryPrefix}${timestamp.slice(-8)}${random}`;
  }

  // Generate QR Code
  static async generateQRCode(data: BarcodeData): Promise<Buffer> {
    const qrData = JSON.stringify({
      id: data.id,
      item_id: data.data.item_id,
      nama_barang: data.data.nama_barang,
      sku: data.data.sku,
      created_at: data.data.created_at
    });

    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      type: 'png',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeBuffer;
  }

  // Generate Barcode
  static async generateBarcode(data: BarcodeData): Promise<Buffer> {
    const canvas = createCanvas(300, 100);
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 300, 100);

    try {
      JsBarcode(canvas, data.id, {
        format: data.format || 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
        textAlign: 'center',
        textPosition: 'bottom'
      });
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw new Error('Failed to generate barcode');
    }

    return canvas.toBuffer('image/png');
  }

  // Generate single sticker with item info
  static async generateSticker(
    itemData: BarcodeData, 
    options: Partial<StickerOptions> = {}
  ): Promise<Buffer> {
    const opts: StickerOptions = {
      width: 250,
      height: 150,
      fontSize: 10,
      includeText: true,
      itemsPerRow: 1,
      itemsPerPage: 1,
      ...options
    };

    const canvas = createCanvas(opts.width, opts.height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, opts.width, opts.height);

    // Border
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, opts.width - 4, opts.height - 4);

    let yPosition = 10;

    // Title
    if (opts.includeText) {
      ctx.fillStyle = 'black';
      ctx.font = `bold ${opts.fontSize + 2}px Arial`;
      ctx.textAlign = 'center';
      
      // Truncate long names
      let displayName = itemData.data.nama_barang;
      if (displayName.length > 25) {
        displayName = displayName.substring(0, 22) + '...';
      }
      
      ctx.fillText(displayName, opts.width / 2, yPosition + 15);
      yPosition += 25;
    }

    // Generate and draw QR code
    try {
      const qrBuffer = await this.generateQRCode(itemData);
      const qrSize = Math.min(80, opts.width - 40);
      
      // Convert buffer to image data (simplified approach)
      // In production, you might want to use a proper image loading library
      const qrX = (opts.width - qrSize) / 2;
      yPosition += 5;
      
      // Draw placeholder for QR code area
      ctx.strokeStyle = '#999999';
      ctx.strokeRect(qrX, yPosition, qrSize, qrSize);
      ctx.fillStyle = '#F0F0F0';
      ctx.fillRect(qrX + 1, yPosition + 1, qrSize - 2, qrSize - 2);
      
      // Add QR text indicator
      ctx.fillStyle = 'black';
      ctx.font = `${opts.fontSize - 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', opts.width / 2, yPosition + qrSize / 2 + 3);
      
      yPosition += qrSize + 10;
    } catch (error) {
      console.error('Error adding QR code to sticker:', error);
    }

    // Item details
    if (opts.includeText) {
      ctx.font = `${opts.fontSize - 1}px Arial`;
      ctx.textAlign = 'left';
      
      const details = [
        `ID: ${itemData.data.item_id}`,
        `SKU: ${itemData.data.sku || itemData.id}`,
        `Kategori: ${itemData.data.kategori || 'N/A'}`,
        `Lokasi: ${itemData.data.lokasi_gudang || 'N/A'}`
      ];

      details.forEach((detail, index) => {
        if (yPosition + (index * 12) < opts.height - 10) {
          ctx.fillText(detail, 10, yPosition + (index * 12));
        }
      });
    }

    return canvas.toBuffer('image/png');
  }

  // Generate PDF with multiple stickers
  static async generateStickerPDF(
    items: BarcodeData[],
    options: Partial<StickerOptions> = {}
  ): Promise<Buffer> {
    const opts: StickerOptions = {
      width: 200,
      height: 120,
      fontSize: 9,
      includeText: true,
      itemsPerRow: 3,
      itemsPerPage: 12,
      ...options
    };

    const doc = new PDFDocument({
      size: 'A4',
      margin: 20
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    let itemIndex = 0;
    let currentRow = 0;
    let currentCol = 0;

    for (const item of items) {
      // Check if we need a new page
      if (itemIndex > 0 && itemIndex % opts.itemsPerPage === 0) {
        doc.addPage();
        currentRow = 0;
        currentCol = 0;
      }

      const x = 20 + (currentCol * (opts.width + 10));
      const y = 20 + (currentRow * (opts.height + 15));

      // Draw sticker border
      doc.rect(x, y, opts.width, opts.height).stroke('#CCCCCC');

      // Item name
      if (opts.includeText) {
        let displayName = item.data.nama_barang;
        if (displayName.length > 30) {
          displayName = displayName.substring(0, 27) + '...';
        }
        
        doc.fontSize(opts.fontSize + 1)
           .font('Helvetica-Bold')
           .text(displayName, x + 5, y + 5, {
             width: opts.width - 10,
             align: 'center'
           });
      }

      // QR Code placeholder (in real implementation, you'd embed the actual QR image)
      const qrSize = 60;
      const qrX = x + (opts.width - qrSize) / 2;
      const qrY = y + 25;
      
      doc.rect(qrX, qrY, qrSize, qrSize).stroke('#999999');
      doc.fontSize(8)
         .font('Helvetica')
         .text('QR CODE', qrX, qrY + qrSize / 2 - 4, {
           width: qrSize,
           align: 'center'
         });

      // Item details
      if (opts.includeText) {
        const detailsY = qrY + qrSize + 5;
        doc.fontSize(opts.fontSize - 1)
           .font('Helvetica')
           .text(`ID: ${item.data.item_id}`, x + 5, detailsY)
           .text(`SKU: ${item.data.sku || item.id}`, x + 5, detailsY + 10);
      }

      // Move to next position
      currentCol++;
      if (currentCol >= opts.itemsPerRow) {
        currentCol = 0;
        currentRow++;
      }
      
      itemIndex++;
    }

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  // Parse scanned barcode/QR data
  static parseScannedData(scannedString: string): any {
    try {
      // Try to parse as JSON (QR code format)
      const parsed = JSON.parse(scannedString);
      if (parsed.item_id || parsed.id) {
        return {
          type: 'qrcode',
          data: parsed
        };
      }
    } catch (error) {
      // Not JSON, treat as barcode
      return {
        type: 'barcode',
        data: {
          sku: scannedString.trim(),
          scanned_code: scannedString.trim()
        }
      };
    }

    return {
      type: 'unknown',
      data: {
        raw: scannedString
      }
    };
  }

  // Generate batch codes for multiple items
  static async generateBatchCodes(
    items: Array<{
      id: number;
      nama_barang: string;
      kategori?: string;
      lokasi_gudang?: string;
    }>,
    type: 'qrcode' | 'barcode' = 'qrcode'
  ): Promise<BarcodeData[]> {
    
    return items.map(item => ({
      id: this.generateSKU(),
      type,
      format: 'CODE128',
      data: {
        item_id: item.id,
        nama_barang: item.nama_barang,
        sku: this.generateSKU(),
        kategori: item.kategori,
        lokasi_gudang: item.lokasi_gudang,
        created_at: new Date()
      }
    }));
  }

  // Save generated codes to file system or S3
  static async saveCodeImage(
    codeBuffer: Buffer,
    filename: string,
    folder: string = 'barcodes'
  ): Promise<string> {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', folder);
      
      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, codeBuffer);

      return `/uploads/${folder}/${filename}`;
    } catch (error) {
      console.error('Error saving code image:', error);
      throw new Error('Failed to save barcode image');
    }
  }

  // Validate barcode format
  static validateBarcodeFormat(code: string, format: string): boolean {
    const patterns = {
      'CODE128': /^[\x00-\x7F]+$/, // ASCII characters
      'CODE39': /^[A-Z0-9\-. $/+%]+$/, // CODE39 character set
      'EAN13': /^\d{13}$/, // 13 digits
      'EAN8': /^\d{8}$/, // 8 digits
      'UPC': /^\d{12}$/ // 12 digits
    };

    const pattern = patterns[format as keyof typeof patterns];
    return pattern ? pattern.test(code) : true;
  }
}
