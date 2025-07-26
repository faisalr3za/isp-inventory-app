import { Request, Response } from 'express';
import { db } from '../config/database';
import { Category, CreateCategoryData, UpdateCategoryData } from '../models/Category';
import Joi from 'joi';

// Validation schemas
const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  code: Joi.string().min(2).max(20).required(),
  is_active: Joi.boolean().optional()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  code: Joi.string().min(2).max(20).optional(),
  is_active: Joi.boolean().optional()
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('categories').select('*');

    // Search filter
    if (search) {
      query = query.where('name', 'ilike', `%${search}%`)
                   .orWhere('code', 'ilike', `%${search}%`);
    }

    // Active filter
    if (active !== undefined) {
      query = query.where('is_active', active === 'true');
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('* as count');
    const total = Number(count);

    // Get paginated results
    const categories = await query
      .orderBy('name', 'asc')
      .limit(Number(limit))
      .offset(offset);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kategori'
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await db('categories')
      .where('id', id)
      .first();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kategori'
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.details.map(d => d.message)
      });
    }

    const categoryData: CreateCategoryData = value;

    // Check if code already exists
    const existingCategory = await db('categories')
      .where('code', categoryData.code)
      .first();

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Kode kategori sudah digunakan'
      });
    }

    const [newCategory] = await db('categories')
      .insert({
        ...categoryData,
        updated_at: new Date()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat kategori'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCategorySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.details.map(d => d.message)
      });
    }

    const updateData: UpdateCategoryData = value;

    // Check if category exists
    const existingCategory = await db('categories')
      .where('id', id)
      .first();

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    // Check if code already exists (excluding current category)
    if (updateData.code) {
      const codeExists = await db('categories')
        .where('code', updateData.code)
        .andWhere('id', '!=', id)
        .first();

      if (codeExists) {
        return res.status(409).json({
          success: false,
          message: 'Kode kategori sudah digunakan'
        });
      }
    }

    const [updatedCategory] = await db('categories')
      .where('id', id)
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    res.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kategori'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await db('categories')
      .where('id', id)
      .first();

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    // Check if category is being used by inventory items
    const itemsCount = await db('inventory_items')
      .where('category_id', id)
      .count('* as count')
      .first();

    if (Number(itemsCount?.count) > 0) {
      return res.status(409).json({
        success: false,
        message: 'Kategori tidak dapat dihapus karena masih digunakan oleh item inventory'
      });
    }

    await db('categories')
      .where('id', id)
      .del();

    res.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori'
    });
  }
};
