export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'technician' | 'sales';
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  supplier_id?: number;
  cost_price: number;
  selling_price: number;
  quantity: number;
  minimum_stock: number;
  location?: string;
  barcode?: string;
  qr_code?: string;
  barcode_path?: string;
  qr_code_path?: string;
  category?: Category;
  supplier?: Supplier;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: number;
  item_id: number;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_number?: string;
  notes?: string;
  user_id: number;
  item?: InventoryItem;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface ScanResult {
  success: boolean;
  data?: {
    item: InventoryItem;
    movement?: InventoryMovement;
  };
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface BarcodeGenerateRequest {
  itemId: number;
  format?: 'CODE128' | 'EAN13' | 'EAN8';
  width?: number;
  height?: number;
}

export interface QRCodeGenerateRequest {
  itemId: number;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface StickerRequest {
  itemId: number;
  includeQR?: boolean;
  includeBarcode?: boolean;
  includeName?: boolean;
  includePrice?: boolean;
}

export interface BulkImportRequest {
  barcodes: string[];
  defaultCategory?: number;
  defaultSupplier?: number;
}

export interface ScannerConfig {
  width: number;
  height: number;
  fps: number;
  qrbox?: {
    width: number;
    height: number;
  };
  aspectRatio: number;
  disableFlip: boolean;
  videoConstraints: {
    facingMode: 'environment';
  };
}
