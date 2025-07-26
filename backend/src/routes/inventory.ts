import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  adjustStock,
  getLowStockItems,
  deleteInventoryItem
} from '../controllers/inventoryController';
import {
  getInventoryMovements,
  getMovementsByItemId,
  getMovementStats
} from '../controllers/movementController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  GET /api/inventory/movements/stats
// @desc   Get movement statistics
// @access Private
router.get('/movements/stats', asyncHandler(getMovementStats));

// @route  GET /api/inventory/movements
// @desc   Get all inventory movements
// @access Private
router.get('/movements', asyncHandler(getInventoryMovements));

// @route  GET /api/inventory/low-stock
// @desc   Get low stock items
// @access Private
router.get('/low-stock', asyncHandler(getLowStockItems));

// @route  GET /api/inventory
// @desc   Get all inventory items
// @access Private
router.get('/', asyncHandler(getInventoryItems));

// @route  GET /api/inventory/:id
// @desc   Get inventory item by ID
// @access Private
router.get('/:id', asyncHandler(getInventoryItemById));

// @route  POST /api/inventory
// @desc   Create new inventory item
// @access Private
router.post('/', asyncHandler(createInventoryItem));

// @route  PUT /api/inventory/:id
// @desc   Update inventory item
// @access Private
router.put('/:id', asyncHandler(updateInventoryItem));

// @route  GET /api/inventory/:id/movements
// @desc   Get movements for specific inventory item
// @access Private
router.get('/:id/movements', asyncHandler(getMovementsByItemId));

// @route  POST /api/inventory/:id/adjust-stock
// @desc   Adjust stock for inventory item
// @access Private
router.post('/:id/adjust-stock', asyncHandler(adjustStock));

// @route  DELETE /api/inventory/:id
// @desc   Delete inventory item
// @access Private
router.delete('/:id', asyncHandler(deleteInventoryItem));

export default router;
