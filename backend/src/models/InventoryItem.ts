export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  supplier_id?: number;
  brand?: string;
  model?: string;
  purchase_price: number;
  selling_price: number;
  quantity_in_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit: string;
  location?: string;
  barcode?: string;
  serial_number?: string;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  status: 'active' | 'inactive' | 'discontinued';
  image_url?: string;
  specifications?: any;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  category?: {
    id: number;
    name: string;
    code: string;
  };
  supplier?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateInventoryItemData {
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  supplier_id?: number;
  brand?: string;
  model?: string;
  purchase_price?: number;
  selling_price?: number;
  quantity_in_stock?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  unit?: string;
  location?: string;
  barcode?: string;
  serial_number?: string;
  condition?: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  status?: 'active' | 'inactive' | 'discontinued';
  image_url?: string;
  specifications?: any;
  notes?: string;
}

export interface UpdateInventoryItemData {
  sku?: string;
  name?: string;
  description?: string;
  category_id?: number;
  supplier_id?: number;
  brand?: string;
  model?: string;
  purchase_price?: number;
  selling_price?: number;
  quantity_in_stock?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  unit?: string;
  location?: string;
  barcode?: string;
  serial_number?: string;
  condition?: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  status?: 'active' | 'inactive' | 'discontinued';
  image_url?: string;
  specifications?: any;
  notes?: string;
}
