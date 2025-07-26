import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  GET /api/categories
// @desc   Get all categories
// @access Private
router.get('/', asyncHandler(getCategories));

// @route  GET /api/categories/:id
// @desc   Get category by ID
// @access Private
router.get('/:id', asyncHandler(getCategoryById));

// @route  POST /api/categories
// @desc   Create new category
// @access Private
router.post('/', asyncHandler(createCategory));

// @route  PUT /api/categories/:id
// @desc   Update category
// @access Private
router.put('/:id', asyncHandler(updateCategory));

// @route  DELETE /api/categories/:id
// @desc   Delete category
// @access Private
router.delete('/:id', asyncHandler(deleteCategory));

export default router;
