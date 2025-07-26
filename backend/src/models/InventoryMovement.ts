export interface InventoryMovement {
  id: number;
  item_id: number;
  user_id: number;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  unit_cost?: number;
  reference_number?: string;
  location_from?: string;
  location_to?: string;
  reason?: string;
  notes?: string;
  movement_date: Date;
  created_at: Date;
  
  // Relations
  item?: {
    id: number;
    sku: string;
    name: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateInventoryMovementData {
  item_id: number;
  user_id: number;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  unit_cost?: number;
  reference_number?: string;
  location_from?: string;
  location_to?: string;
  reason?: string;
  notes?: string;
  movement_date?: Date;
}
