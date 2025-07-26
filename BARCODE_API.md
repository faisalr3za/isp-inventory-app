# Barcode & QR Code API Documentation

## Overview
API untuk mengelola barcode dan QR code pada sistem inventori, termasuk generate, scan, dan cetak sticker.

## Base URL
```
http://localhost:3000/api/barcode
```

## Authentication
Semua endpoint memerlukan Bearer token di header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Generate QR Code untuk Item
**POST** `/generate/qr/:itemId`

Generate QR code untuk inventory item tertentu.

**Parameters:**
- `itemId` (path): ID inventory item

**Response:**
```json
{
  "success": true,
  "message": "QR Code berhasil dibuat",
  "data": {
    "qr_code": "INV1735185231001",
    "image_path": "/uploads/barcodes/qr_123_1735185231.png",
    "item_info": {
      "id": 123,
      "nama_barang": "Router TP-Link AC1200",
      "sku": "RTR001"
    }
  }
}
```

### 2. Generate Barcode untuk Item
**POST** `/generate/barcode/:itemId`

Generate barcode untuk inventory item tertentu.

**Parameters:**
- `itemId` (path): ID inventory item

**Request Body:**
```json
{
  "format": "CODE128"
}
```

**Supported Formats:**
- `CODE128` (default)
- `CODE39`
- `EAN13`
- `EAN8`
- `UPC`

**Response:**
```json
{
  "success": true,
  "message": "Barcode berhasil dibuat",
  "data": {
    "barcode": "RTR001",
    "format": "CODE128",
    "image_path": "/uploads/barcodes/barcode_123_1735185231.png",
    "item_info": {
      "id": 123,
      "nama_barang": "Router TP-Link AC1200",
      "sku": "RTR001"
    }
  }
}
```

### 3. Generate Single Sticker
**POST** `/sticker/:itemId`

Generate sticker dengan QR code dan informasi item untuk dicetak.

**Parameters:**
- `itemId` (path): ID inventory item

**Request Body:**
```json
{
  "width": 250,
  "height": 150,
  "fontSize": 10,
  "includeText": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sticker berhasil dibuat",
  "data": {
    "sticker_path": "/uploads/stickers/sticker_123_1735185231.png",
    "item_info": {
      "id": 123,
      "nama_barang": "Router TP-Link AC1200",
      "sku": "RTR001"
    },
    "options": {
      "width": 250,
      "height": 150,
      "fontSize": 10,
      "includeText": true
    }
  }
}
```

### 4. Generate Batch Stickers (PDF)
**POST** `/stickers/batch`

Generate sticker dalam format PDF untuk multiple items.

**Request Body:**
```json
{
  "itemIds": [123, 124, 125],
  "options": {
    "width": 200,
    "height": 120,
    "fontSize": 9,
    "includeText": true,
    "itemsPerRow": 3,
    "itemsPerPage": 12
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch stickers berhasil dibuat untuk 3 item",
  "data": {
    "pdf_path": "/uploads/stickers/batch_stickers_1735185231.pdf",
    "items_count": 3,
    "items": [
      {
        "id": 123,
        "nama_barang": "Router TP-Link AC1200",
        "sku": "RTR001"
      }
    ]
  }
}
```

### 5. Scan Barcode/QR Code
**POST** `/scan`

Scan barcode atau QR code untuk mencari dan mengelola inventory item.

**Request Body:**
```json
{
  "scannedData": "RTR001",
  "action": "lookup"
}
```

**Available Actions:**
- `lookup` (default): Hanya mencari item
- `stock_in`: Siap untuk menambah stok
- `stock_out`: Siap untuk mengurangi stok

**Response:**
```json
{
  "success": true,
  "message": "Scan berhasil",
  "data": {
    "item": {
      "id": 123,
      "nama_barang": "Router TP-Link AC1200",
      "sku": "RTR001",
      "stok": 50,
      "kategori": "Networking",
      "lokasi_gudang": "Rak A-01",
      "harga_beli": 250000,
      "harga_jual": 350000
    },
    "scan_info": {
      "type": "barcode",
      "scanned_at": "2024-12-26T10:30:00.000Z",
      "scanned_by": 2
    },
    "action": "lookup",
    "message": "Item ditemukan"
  }
}
```

**QR Code Scan Response:**
```json
{
  "success": true,
  "message": "Scan berhasil",
  "data": {
    "item": {
      "id": 123,
      "nama_barang": "Router TP-Link AC1200",
      "sku": "RTR001",
      "stok": 50
    },
    "scan_info": {
      "type": "qrcode",
      "scanned_at": "2024-12-26T10:30:00.000Z",
      "scanned_by": 2
    },
    "action": "stock_out",
    "message": "Siap untuk stock out",
    "next_step": "Input jumlah barang keluar",
    "current_stock": 50
  }
}
```

### 6. Get Item by Code
**GET** `/item/:code`

Mencari item berdasarkan barcode atau QR code.

**Parameters:**
- `code` (path): Barcode atau QR code

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 123,
        "nama_barang": "Router TP-Link AC1200",
        "sku": "RTR001",
        "stok": 50,
        "kategori": "Networking",
        "lokasi_gudang": "Rak A-01",
        "qr_code": "INV1735185231001",
        "barcode": "RTR001"
      }
    ],
    "search_term": "RTR001"
  }
}
```

### 7. Generate SKU
**POST** `/generate-sku`

Generate SKU unik untuk item baru.

**Request Body:**
```json
{
  "prefix": "RTR",
  "kategori": "Router"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sku": "RTR18523100012",
    "prefix": "RTR",
    "generated_at": "2024-12-26T10:30:00.000Z"
  }
}
```

### 8. Download File
**GET** `/download/:filename`

Download file sticker atau barcode.

**Parameters:**
- `filename` (path): Nama file
- `type` (query): Type folder (`stickers`, `barcodes`)

**Example:**
```
GET /api/barcode/download/sticker_123_1735185231.png?type=stickers
```

**Response:** File binary data dengan appropriate headers

## Use Cases

### 1. Barang Baru Masuk (Admin Gudang)
1. Admin membuat item baru di sistem
2. Generate QR code: `POST /generate/qr/:itemId`
3. Cetak sticker: `POST /sticker/:itemId`
4. Tempel sticker pada barang fisik

### 2. Barang Masuk (Scan QR Code)
1. Scan QR code dengan kamera HP
2. Kirim data scan: `POST /scan` dengan action `stock_in`
3. Input jumlah barang masuk
4. Update stok di sistem

### 3. Barang Keluar (Scan QR Code)
1. Scan QR code barang yang akan keluar
2. Kirim data scan: `POST /scan` dengan action `stock_out`
3. Input jumlah barang keluar
4. Update stok di sistem

### 4. Cetak Sticker Massal
1. Pilih multiple items dari inventory
2. Generate batch stickers: `POST /stickers/batch`
3. Download PDF dan cetak ke printer sticker

## QR Code Format
QR code menyimpan data dalam format JSON:
```json
{
  "id": "INV1735185231001",
  "item_id": 123,
  "nama_barang": "Router TP-Link AC1200",
  "sku": "RTR001",
  "created_at": "2024-12-26T10:30:00.000Z"
}
```

## Barcode Format
Barcode menggunakan SKU atau kode unik item dalam format text sederhana.

## Sticker Specifications

### Default Sticker Size
- **Width:** 250px (approx 6.5cm)
- **Height:** 150px (approx 4cm)
- **Format:** PNG/PDF
- **Resolution:** 300 DPI untuk print quality

### PDF Batch Options
- **Items per row:** 3 (default)
- **Items per page:** 12 (default)
- **Paper size:** A4
- **Format:** PDF untuk kemudahan print

## Error Responses

### Item Not Found
```json
{
  "success": false,
  "message": "Item tidak ditemukan"
}
```

### Scan Failed
```json
{
  "success": false,
  "message": "Item tidak ditemukan dengan code yang discan",
  "scanned_info": {
    "type": "unknown",
    "raw_data": "INVALID_CODE",
    "parsed_data": {
      "raw": "INVALID_CODE"
    }
  }
}
```

### Invalid Format
```json
{
  "success": false,
  "message": "Format barcode tidak valid"
}
```

## Mobile App Integration

Untuk integrasi dengan mobile app (React Native):

1. **Install barcode scanner:**
   ```bash
   npm install react-native-camera
   # atau
   npm install expo-barcode-scanner
   ```

2. **Scan QR Code/Barcode:**
   ```javascript
   const handleBarCodeScanned = async ({ data }) => {
     try {
       const response = await fetch('/api/barcode/scan', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           scannedData: data,
           action: 'lookup'
         })
       });
       
       const result = await response.json();
       if (result.success) {
         // Handle successful scan
         setScannedItem(result.data.item);
       }
     } catch (error) {
       console.error('Scan error:', error);
     }
   };
   ```

3. **Generate Sticker:**
   ```javascript
   const generateSticker = async (itemId) => {
     const response = await fetch(`/api/barcode/sticker/${itemId}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     
     const result = await response.json();
     return result.data.sticker_path;
   };
   ```

## Printer Requirements

### Sticker Printer
- **Recommended:** Brother QL-800/820NWB
- **Paper:** Continuous length tape or die-cut labels
- **Size:** 62mm x 29mm or similar
- **Connection:** USB/WiFi

### PDF Printing
- Standard A4 printer
- Sticker paper A4 format
- Cut manually after printing

---

**Note:** Sistem ini mendukung scanning dengan kamera HP dan dapat generate serta cetak QR code/barcode sticker untuk ditempel pada unit barang fisik.
