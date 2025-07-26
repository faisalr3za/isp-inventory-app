import { Request, Response } from 'express';
import { db } from '../config/database';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '../models/Supplier';
import Joi from 'joi';

// Validation schemas
const createSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  code: Joi.string().min(2).max(20).required(),
  contact_person: Joi.string().max(100).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().max(100).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(50).optional().allow(''),
  postal_code: Joi.string().max(10).optional().allow(''),
  is_active: Joi.boolean().optional()
});

const updateSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  code: Joi.string().min(2).max(20).optional(),
  contact_person: Joi.string().max(100).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().max(100).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(50).optional().allow(''),
  postal_code: Joi.string().max(10).optional().allow(''),
  is_active: Joi.boolean().optional()
});

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('suppliers').select('*');

    // Search filter
    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
            .orWhere('code', 'ilike', `%${search}%`)
            .orWhere('contact_person', 'ilike', `%${search}%`)
            .orWhere('email', 'ilike', `%${search}%`);
      });
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
    const suppliers = await query
      .orderBy('name', 'asc')
      .limit(Number(limit))
      .offset(offset);

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total,
          total_pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data supplier'
    });
  }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supplier = await db('suppliers')
      .where('id', id)
      .first();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier tidak ditemukan'
      });
    }

    // Get supplier statistics
    const stats = await db('inventory_items')
      .where('supplier_id', id)
      .select(
        db.raw('COUNT(*) as total_items'),
        db.raw('SUM(quantity_in_stock) as total_stock'),
        db.raw('SUM(quantity_in_stock * purchase_price) as total_value')
      )
      .first();

    res.json({
      success: true,
      data: {
        ...supplier,
        stats: {
          total_items: Number(stats?.total_items || 0),
          total_stock: Number(stats?.total_stock || 0),
          total_value: Number(stats?.total_value || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data supplier'
    });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { error, value } = createSupplierSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.details.map(d => d.message)
      });
    }

    const supplierData: CreateSupplierData = value;

    // Check if code already exists
    const existingSupplier = await db('suppliers')
      .where('code', supplierData.code)
      .first();

    if (existingSupplier) {
      return res.status(409).json({
        success: false,
        message: 'Kode supplier sudah digunakan'
      });
    }

    // Check if email already exists (if provided)
    if (supplierData.email) {
      const emailExists = await db('suppliers')
        .where('email', supplierData.email)
        .first();

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah digunakan'
        });
      }
    }

    const [newSupplier] = await db('suppliers')
      .insert({
        ...supplierData,
        updated_at: new Date()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Supplier berhasil dibuat',
      data: newSupplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat supplier'
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateSupplierSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.details.map(d => d.message)
      });
    }

    const updateData: UpdateSupplierData = value;

    // Check if supplier exists
    const existingSupplier = await db('suppliers')
      .where('id', id)
      .first();

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier tidak ditemukan'
      });
    }

    // Check if code already exists (excluding current supplier)
    if (updateData.code) {
      const codeExists = await db('suppliers')
        .where('code', updateData.code)
        .andWhere('id', '!=', id)
        .first();

      if (codeExists) {
        return res.status(409).json({
          success: false,
          message: 'Kode supplier sudah digunakan'
        });
      }
    }

    // Check if email already exists (excluding current supplier)
    if (updateData.email) {
      const emailExists = await db('suppliers')
        .where('email', updateData.email)
        .andWhere('id', '!=', id)
        .first();

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah digunakan'
        });
      }
    }

    const [updatedSupplier] = await db('suppliers')
      .where('id', id)
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    res.json({
      success: true,
      message: 'Supplier berhasil diperbarui',
      data: updatedSupplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui supplier'
    });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const existingSupplier = await db('suppliers')
      .where('id', id)
      .first();

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier tidak ditemukan'
      });
    }

    // Check if supplier is being used by inventory items
    const itemsCount = await db('inventory_items')
      .where('supplier_id', id)
      .count('* as count')
      .first();

    if (Number(itemsCount?.count) > 0) {
      return res.status(409).json({
        success: false,
        message: 'Supplier tidak dapat dihapus karena masih digunakan oleh item inventory'
      });
    }

    await db('suppliers')
      .where('id', id)
      .del();

    res.json({
      success: true,
      message: 'Supplier berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus supplier'
    });
  }
};
