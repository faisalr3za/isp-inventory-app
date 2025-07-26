import { Request, Response } from 'express';
import { db } from '../config/database';
import { InventoryItem, CreateInventoryItemData, UpdateInventoryItemData } from '../models/InventoryItem';
import { CreateInventoryMovementData } from '../models/InventoryMovement';
import Joi from 'joi';
import { io } from '../server';

// Validation schemas
const createInventoryItemSchema = Joi.object({
  sku: Joi.string().min(2).max(50).required(),
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  category_id: Joi.number().integer().positive().required(),
  supplier_id: Joi.number().integer().positive().optional(),
  brand: Joi.string().max(100).optional().allow(''),
  model: Joi.string().max(100).optional().allow(''),
  purchase_price: Joi.number().min(0).optional(),
  selling_price: Joi.number().min(0).optional(),
  quantity_in_stock: Joi.number().integer().min(0).optional(),
  minimum_stock: Joi.number().integer().min(0).optional(),
  maximum_stock: Joi.number().integer().min(0).optional(),
  unit: Joi.string().max(20).optional(),
  location: Joi.string().max(100).optional().allow(''),
  barcode: Joi.string().max(100).optional().allow(''),
  serial_number: Joi.string().max(100).optional().allow(''),
  condition: Joi.string().valid('new', 'good', 'fair', 'poor', 'damaged').optional(),
  status: Joi.string().valid('active', 'inactive', 'discontinued').optional(),
  image_url: Joi.string().max(500).optional().allow(''),
  specifications: Joi.object().optional(),
  notes: Joi.string().max(1000).optional().allow('')
});

const updateInventoryItemSchema = createInventoryItemSchema.fork(
  ['sku', 'name', 'category_id'], (schema) => schema.optional()
);

const stockAdjustmentSchema = Joi.object({
  quantity: Joi.number().integer().required(),
  movement_type: Joi.string().valid('in', 'out', 'adjustment').required(),
  reason: Joi.string().max(500).required(),
  notes: Joi.string().max(1000).optional().allow(''),
  unit_cost: Joi.number().min(0).optional(),
  reference_number: Joi.string().max(50).optional().allow('')
});

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category_id, 
      supplier_id, 
      status = 'active',
      low_stock = false,
      condition 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('inventory_items')
      .select(
        'inventory_items.*',
        'categories.name as category_name',
        'categories.code as category_code',
        'suppliers.name as supplier_name',
        'suppliers.code as supplier_code'
      )
      .leftJoin('categories', 'inventory_items.category_id', 'categories.id')
      .leftJoin('suppliers', 'inventory_items.supplier_id', 'suppliers.id');

    // Search filter
    if (search) {
      query = query.where(function() {
        this.where('inventory_items.name', 'ilike', `%${search}%`)
            .orWhere('inventory_items.sku', 'ilike', `%${search}%`)
            .orWhere('inventory_items.barcode', 'ilike', `%${search}%`)
            .orWhere('categories.name', 'ilike', `%${search}%`);
      });
    }

    // Category filter
    if (category_id) {
      query = query.where('inventory_items.category_id', category_id);
    }

    // Supplier filter
    if (supplier_id) {
      query = query.where('inventory_items.supplier_id', supplier_id);
    }

    // Status filter
    if (status) {
      query = query.where('inventory_items.status', status);
    }

    // Condition filter
    if (condition) {
      query = query.where('inventory_items.condition', condition);
    }

    // Low stock filter
    if (low_stock === 'true') {
      query = query.whereRaw('inventory_items.quantity_in_stock <= inventory_items.minimum_stock');
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('inventory_items.id as count');
    const total = Number(count);

    // Get paginated results
    const items = await query
      .orderBy('inventory_items.name', 'asc')
      .limit(Number(limit))
      .offset(offset);

    // Transform results to include relations
    const transformedItems = items.map(item => ({
      ...item,
      category: item.category_name ? {
        id: item.category_id,
        name: item.category_name,
        code: item.category_code
      } : null,
      supplier: item.supplier_name ? {
        id: item.supplier_id,
        name: item.supplier_name,
        code: item.supplier_code
      } : null,
      // Remove redundant fields
      category_name: undefined,
      category_code: undefined,
      supplier_name: undefined,
      supplier_code: undefined
    }));

    res.json({
      success: true,
      data: {
        items: transformedItems,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data inventory'
    });
  }
};

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await db('inventory_items')
      .select(
        'inventory_items.*',
        'categories.name as category_name',
        'categories.code as category_code',
        'suppliers.name as supplier_name',
        'suppliers.code as supplier_code'
      )
      .leftJoin('categories', 'inventory_items.category_id', 'categories.id')
      .leftJoin('suppliers', 'inventory_items.supplier_id', 'suppliers.id')
      .where('inventory_items.id', id)
      .first();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item inventory tidak ditemukan'
      });
    }

    // Transform result
    const transformedItem = {
      ...item,
      category: item.category_name ? {
        id: item.category_id,
        name: item.category_name,
        code: item.category_code
      } : null,
      supplier: item.supplier_name ? {
        id: item.supplier_id,
        name: item.supplier_name,
        code: item.supplier_code
      } : null,
      // Remove redundant fields
      category_name: undefined,
      category_code: undefined,
      supplier_name: undefined,
      supplier_code: undefined
    };

    res.json({
      success: true,
      data: transformedItem
    });
  } catch (error) {
    console.error('Get inventory item by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data item inventory'
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { error, value } = createInventoryItemSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.details.map(d => d.message)
      });
    }

    const itemData: CreateInventoryItemData = value;

    // Check if SKU already exists
    const existingItem = await db('inventory_items')
      .where('sku', itemData.sku)
      .first();

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'SKU sudah digunakan'
      });
    }

    // Verify category exists
    const category = await db('categories')
      .where('id', itemData.category_id)
      .first();

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    // Verify supplier exists (if provided)
    if (itemData.supplier_id) {
      const supplier = await db('suppliers')
        .where('id', itemData.supplier_id)
        .first();

      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier tidak ditemukan'
        });
      }
    }

    const [newItem] = await db('inventory_items')
      .insert({
        ...itemData,
        updated_at: new Date()
      })
      .returning('*');

    // If initial stock > 0, create stock movement record
    if (newItem.quantity_in_stock > 0) {
      const movementData: CreateInventoryMovementData = {
        item_id: newItem.id,
        user_id: (req as any).user.id,
        movement_type: 'in',
        quantity: newItem.quantity_in_stock,
        quantity_before: 0,
        quantity_after: newItem.quantity_in_stock,
        reason: 'Initial stock',
        unit_cost: newItem.purchase_price
      };

      await db('inventory_movements').insert(movementData);
    }

    // Emit real-time update
    io.emit('inventory_update', {
      action: 'create',
      item: newItem
    });

    res.status(201).json({
      success: true,
      message: 'Item inventory berhasil dibuat',
      data: newItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat item inventory'
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateInventoryItemSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.details.map(d => d.message)
      });
    }

    const updateData: UpdateInventoryItemData = value;

    // Check if item exists
    const existingItem = await db('inventory_items')
      .where('id', id)
      .first();

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item inventory tidak ditemukan'
      });
    }

    // Check if SKU already exists (excluding current item)
    if (updateData.sku) {
      const skuExists = await db('inventory_items')
        .where('sku', updateData.sku)
        .andWhere('id', '!=', id)
        .first();

      if (skuExists) {
        return res.status(409).json({
          success: false,
          message: 'SKU sudah digunakan'
        });
      }
    }

    const [updatedItem] = await db('inventory_items')
      .where('id', id)
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    // Emit real-time update
    io.emit('inventory_update', {
      action: 'update',
      item: updatedItem
    });

    res.json({
      success: true,
      message: 'Item inventory berhasil diperbarui',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui item inventory'
    });
  }
};

// @desc    Adjust stock
// @route   POST /api/inventory/:id/adjust-stock
// @access  Private
export const adjustStock = async (req: Request, res: Response) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;
    const { error, value } = stockAdjustmentSchema.validate(req.body);
    
    if (error) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.details.map(d => d.message)
      });
    }

    const { quantity, movement_type, reason, notes, unit_cost, reference_number } = value;

    // Get current item
    const item = await trx('inventory_items')
      .where('id', id)
      .first();

    if (!item) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Item inventory tidak ditemukan'
      });
    }

    const currentStock = item.quantity_in_stock;
    let newStock: number;

    // Calculate new stock based on movement type
    switch (movement_type) {
      case 'in':
        newStock = currentStock + Math.abs(quantity);
        break;
      case 'out':
        newStock = currentStock - Math.abs(quantity);
        if (newStock < 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            message: 'Stok tidak mencukupi'
          });
        }
        break;
      case 'adjustment':
        newStock = quantity;
        break;
      default:
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'Tipe movement tidak valid'
        });
    }

    // Update item stock
    await trx('inventory_items')
      .where('id', id)
      .update({
        quantity_in_stock: newStock,
        updated_at: new Date()
      });

    // Create movement record
    const movementData: CreateInventoryMovementData = {
      item_id: Number(id),
      user_id: (req as any).user.id,
      movement_type,
      quantity: movement_type === 'adjustment' ? (newStock - currentStock) : (movement_type === 'out' ? -Math.abs(quantity) : Math.abs(quantity)),
      quantity_before: currentStock,
      quantity_after: newStock,
      reason,
      notes,
      unit_cost,
      reference_number
    };

    await trx('inventory_movements').insert(movementData);

    await trx.commit();

    // Get updated item with relations
    const updatedItem = await db('inventory_items')
      .select(
        'inventory_items.*',
        'categories.name as category_name',
        'suppliers.name as supplier_name'
      )
      .leftJoin('categories', 'inventory_items.category_id', 'categories.id')
      .leftJoin('suppliers', 'inventory_items.supplier_id', 'suppliers.id')
      .where('inventory_items.id', id)
      .first();

    // Emit real-time update
    io.emit('inventory_update', {
      action: 'stock_adjustment',
      item: updatedItem,
      movement: movementData
    });

    res.json({
      success: true,
      message: 'Stok berhasil disesuaikan',
      data: {
        item: updatedItem,
        previous_stock: currentStock,
        new_stock: newStock,
        adjustment: newStock - currentStock
      }
    });
  } catch (error) {
    await trx.rollback();
    console.error('Adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyesuaikan stok'
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const items = await db('inventory_items')
      .select(
        'inventory_items.*',
        'categories.name as category_name',
        'categories.code as category_code'
      )
      .leftJoin('categories', 'inventory_items.category_id', 'categories.id')
      .whereRaw('inventory_items.quantity_in_stock <= inventory_items.minimum_stock')
      .andWhere('inventory_items.status', 'active')
      .orderBy('inventory_items.quantity_in_stock', 'asc');

    const transformedItems = items.map(item => ({
      ...item,
      category: item.category_name ? {
        id: item.category_id,
        name: item.category_name,
        code: item.category_code
      } : null,
      shortage: item.minimum_stock - item.quantity_in_stock
    }));

    res.json({
      success: true,
      data: transformedItems
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data item stok rendah'
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingItem = await db('inventory_items')
      .where('id', id)
      .first();

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item inventory tidak ditemukan'
      });
    }

    await db('inventory_items')
      .where('id', id)
      .del();

    // Emit real-time update
    io.emit('inventory_update', {
      action: 'delete',
      item_id: id
    });

    res.json({
      success: true,
      message: 'Item inventory berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus item inventory'
    });
  }
};
