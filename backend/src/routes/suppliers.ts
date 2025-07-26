import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  GET /api/suppliers
// @desc   Get all suppliers
// @access Private
router.get('/', asyncHandler(getSuppliers));

// @route  GET /api/suppliers/:id
// @desc   Get supplier by ID
// @access Private
router.get('/:id', asyncHandler(getSupplierById));

// @route  POST /api/suppliers
// @desc   Create new supplier
// @access Private
router.post('/', asyncHandler(createSupplier));

// @route  PUT /api/suppliers/:id
// @desc   Update supplier
// @access Private
router.put('/:id', asyncHandler(updateSupplier));

// @route  DELETE /api/suppliers/:id
// @desc   Delete supplier
// @access Private
router.delete('/:id', asyncHandler(deleteSupplier));

export default router;
