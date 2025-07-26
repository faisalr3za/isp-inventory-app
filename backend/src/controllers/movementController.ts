import { Request, Response } from 'express';
import { db } from '../config/database';
import { InventoryMovement } from '../models/InventoryMovement';

// @desc    Get inventory movements
// @route   GET /api/inventory/movements
// @access  Private
export const getInventoryMovements = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      item_id, 
      movement_type, 
      date_from, 
      date_to,
      user_id
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('inventory_movements')
      .select(
        'inventory_movements.*',
        'inventory_items.sku',
        'inventory_items.name as item_name',
        'users.name as user_name',
        'users.email as user_email'
      )
      .leftJoin('inventory_items', 'inventory_movements.item_id', 'inventory_items.id')
      .leftJoin('users', 'inventory_movements.user_id', 'users.id');

    // Filter by item
    if (item_id) {
      query = query.where('inventory_movements.item_id', item_id);
    }

    // Filter by movement type
    if (movement_type) {
      query = query.where('inventory_movements.movement_type', movement_type);
    }

    // Filter by user
    if (user_id) {
      query = query.where('inventory_movements.user_id', user_id);
    }

    // Filter by date range
    if (date_from) {
      query = query.where('inventory_movements.movement_date', '>=', date_from);
    }
    if (date_to) {
      query = query.where('inventory_movements.movement_date', '<=', date_to);
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('inventory_movements.id as count');
    const total = Number(count);

    // Get paginated results
    const movements = await query
      .orderBy('inventory_movements.movement_date', 'desc')
      .limit(Number(limit))
      .offset(offset);

    // Transform results
    const transformedMovements = movements.map(movement => ({
      ...movement,
      item: movement.sku ? {
        id: movement.item_id,
        sku: movement.sku,
        name: movement.item_name
      } : null,
      user: movement.user_name ? {
        id: movement.user_id,
        name: movement.user_name,
        email: movement.user_email
      } : null,
      // Remove redundant fields
      sku: undefined,
      item_name: undefined,
      user_name: undefined,
      user_email: undefined
    }));

    res.json({
      success: true,
      data: {
        movements: transformedMovements,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get inventory movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data movement inventory'
    });
  }
};

// @desc    Get inventory movements by item ID
// @route   GET /api/inventory/:id/movements
// @access  Private
export const getMovementsByItemId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Check if item exists
    const item = await db('inventory_items')
      .where('id', id)
      .first();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item inventory tidak ditemukan'
      });
    }

    // Get movements
    let query = db('inventory_movements')
      .select(
        'inventory_movements.*',
        'users.name as user_name',
        'users.email as user_email'
      )
      .leftJoin('users', 'inventory_movements.user_id', 'users.id')
      .where('inventory_movements.item_id', id);

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('inventory_movements.id as count');
    const total = Number(count);

    // Get paginated results
    const movements = await query
      .orderBy('inventory_movements.movement_date', 'desc')
      .limit(Number(limit))
      .offset(offset);

    // Transform results
    const transformedMovements = movements.map(movement => ({
      ...movement,
      user: movement.user_name ? {
        id: movement.user_id,
        name: movement.user_name,
        email: movement.user_email
      } : null,
      // Remove redundant fields
      user_name: undefined,
      user_email: undefined
    }));

    res.json({
      success: true,
      data: {
        item: {
          id: item.id,
          sku: item.sku,
          name: item.name,
          current_stock: item.quantity_in_stock
        },
        movements: transformedMovements,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get movements by item ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data movement item'
    });
  }
};

// @desc    Get movement statistics
// @route   GET /api/inventory/movements/stats
// @access  Private
export const getMovementStats = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    let baseQuery = db('inventory_movements');
    
    // Apply date filters if provided
    if (date_from) {
      baseQuery = baseQuery.where('movement_date', '>=', date_from);
    }
    if (date_to) {
      baseQuery = baseQuery.where('movement_date', '<=', date_to);
    }

    // Get movement counts by type
    const movementsByType = await baseQuery.clone()
      .select('movement_type')
      .count('* as count')
      .groupBy('movement_type');

    // Get recent movements (last 7 days)
    const recentMovements = await db('inventory_movements')
      .select(
        db.raw('DATE(movement_date) as date'),
        'movement_type',
        db.raw('COUNT(*) as count')
      )
      .where('movement_date', '>=', db.raw('CURRENT_DATE - INTERVAL \'7 days\''))
      .groupBy(db.raw('DATE(movement_date)'), 'movement_type')
      .orderBy('date', 'desc');

    // Get top items by movement frequency
    const topItems = await baseQuery.clone()
      .select(
        'inventory_items.sku',
        'inventory_items.name',
        db.raw('COUNT(*) as movement_count')
      )
      .leftJoin('inventory_items', 'inventory_movements.item_id', 'inventory_items.id')
      .groupBy('inventory_items.id', 'inventory_items.sku', 'inventory_items.name')
      .orderBy('movement_count', 'desc')
      .limit(10);

    // Get total movement value
    const totalValue = await baseQuery.clone()
      .select(
        db.raw('SUM(CASE WHEN movement_type = \'in\' THEN quantity * COALESCE(unit_cost, 0) ELSE 0 END) as total_in_value'),
        db.raw('SUM(CASE WHEN movement_type = \'out\' THEN quantity * COALESCE(unit_cost, 0) ELSE 0 END) as total_out_value')
      )
      .first();

    res.json({
      success: true,
      data: {
        movements_by_type: movementsByType.reduce((acc, item) => {
          acc[item.movement_type] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        recent_movements: recentMovements,
        top_items: topItems,
        total_values: {
          total_in_value: Number(totalValue?.total_in_value || 0),
          total_out_value: Number(totalValue?.total_out_value || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get movement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik movement'
    });
  }
};
