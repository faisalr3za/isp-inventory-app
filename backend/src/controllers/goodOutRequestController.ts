import { Request, Response } from 'express';
import { GoodOutRequestModel, CreateGoodOutRequestData } from '../models/GoodOutRequest';
import { InventoryItemModel } from '../models/InventoryItem';
import { db } from '../config/database';
import asyncHandler from '../middleware/asyncHandler';
import { io } from '../server';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    username: string;
    nama_lengkap: string;
  };
}

export class GoodOutRequestController {
  
  // @desc    Create good out request (teknisi scan & request)
  // @route   POST /api/good-out-requests
  // @access  Private (teknisi)
  static createRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { item_id, quantity = 1, usage_description, customer_location } = req.body;
    
    // Check if user is teknisi
    if (!req.user || req.user.role !== 'teknisi') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya teknisi yang dapat mengajukan permintaan good out.'
      });
    }

    // Validate required fields
    if (!item_id || !usage_description) {
      return res.status(400).json({
        success: false,
        message: 'Item ID dan keterangan penggunaan harus diisi'
      });
    }

    // Check if item exists and has sufficient stock
    const item = await InventoryItemModel.findById(item_id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan'
      });
    }

    if (item.stok < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Stok tersedia: ${item.stok}, diminta: ${quantity}`
      });
    }

    // Create good out request
    const requestData: CreateGoodOutRequestData = {
      item_id: item_id,
      requested_by: req.user.id,
      quantity: quantity,
      reason: `Pemasangan/instalasi - ${usage_description}`,
      notes: customer_location ? `Lokasi: ${customer_location}` : undefined
    };

    const newRequest = await GoodOutRequestModel.create(requestData);
    const requestWithDetails = await GoodOutRequestModel.findById(newRequest.id!);

    // Emit real-time notification to managers/admins
    io.emit('good_out_request_created', {
      request: requestWithDetails,
      message: `Permintaan good out baru dari ${req.user.nama_lengkap}`
    });

    res.status(201).json({
      success: true,
      message: 'Permintaan good out berhasil dibuat dan menunggu persetujuan',
      data: requestWithDetails
    });
  });

  // @desc    Get all good out requests
  // @route   GET /api/good-out-requests
  // @access  Private
  static getRequests = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      requested_by, 
      my_requests 
    } = req.query;

    let filters: any = {};

    // If user is teknisi, they can only see their own requests
    if (req.user?.role === 'teknisi') {
      filters.requested_by = req.user.id;
    } else {
      // Admin/Manager can see all requests or filter by specific user
      if (requested_by) {
        filters.requested_by = Number(requested_by);
      }
      if (my_requests === 'true') {
        filters.requested_by = req.user?.id;
      }
    }

    if (status) {
      filters.status = status;
    }

    const result = await GoodOutRequestModel.findAll({
      page: Number(page),
      limit: Number(limit),
      ...filters
    });

    res.json({
      success: true,
      data: result
    });
  });

  // @desc    Get single good out request
  // @route   GET /api/good-out-requests/:id
  // @access  Private
  static getRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const request = await GoodOutRequestModel.findById(Number(id));
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan tidak ditemukan'
      });
    }

    // Check access - teknisi can only see their own requests
    if (req.user?.role === 'teknisi' && request.requested_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }

    res.json({
      success: true,
      data: request
    });
  });

  // @desc    Approve good out request
  // @route   PUT /api/good-out-requests/:id/approve
  // @access  Private (admin, manager)
  static approveRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    // Check permission
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan manager yang dapat menyetujui permintaan.'
      });
    }

    const request = await GoodOutRequestModel.findById(Number(id));
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan tidak ditemukan'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Permintaan sudah diproses sebelumnya'
      });
    }

    // Check stock availability again
    const item = await InventoryItemModel.findById(request.item_id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan'
      });
    }

    if (item.stok < request.quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Stok tersedia: ${item.stok}, diminta: ${request.quantity}`
      });
    }

    // Start transaction
    const trx = await db.transaction();
    
    try {
      // Update request status
      await trx('good_out_requests')
        .where('id', id)
        .update({
          status: 'approved',
          approved_by: req.user.id,
          approved_at: new Date(),
          updated_at: new Date()
        });

      // Update item stock
      const newStock = item.stok - request.quantity;
      await trx('inventory_items')
        .where('id', request.item_id)
        .update({
          stok: newStock,
          updated_at: new Date()
        });

      // Create inventory movement record
      await trx('inventory_movements').insert({
        item_id: request.item_id,
        user_id: req.user.id,
        movement_type: 'out',
        quantity: -request.quantity,
        quantity_before: item.stok,
        quantity_after: newStock,
        reason: `Good out approved - ${request.reason}`,
        notes: `Request ID: ${request.id}, Teknisi: ${request.requester?.nama_lengkap}`,
        reference_number: `REQ-${request.id}`,
        movement_date: new Date()
      });

      await trx.commit();

      // Get updated request
      const updatedRequest = await GoodOutRequestModel.findById(Number(id));

      // Emit notification
      io.emit('good_out_request_approved', {
        request: updatedRequest,
        message: `Permintaan good out disetujui oleh ${req.user.nama_lengkap}`
      });

      res.json({
        success: true,
        message: 'Permintaan berhasil disetujui dan barang telah dikeluarkan dari inventory',
        data: updatedRequest
      });

    } catch (error) {
      await trx.rollback();
      console.error('Error approving request:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menyetujui permintaan'
      });
    }
  });

  // @desc    Reject good out request
  // @route   PUT /api/good-out-requests/:id/reject
  // @access  Private (admin, manager)
  static rejectRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    
    // Check permission
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan manager yang dapat menolak permintaan.'
      });
    }

    const request = await GoodOutRequestModel.findById(Number(id));
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan tidak ditemukan'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Permintaan sudah diproses sebelumnya'
      });
    }

    // Update request status
    const updatedRequest = await GoodOutRequestModel.update(Number(id), {
      status: 'rejected',
      approved_by: req.user.id,
      approved_at: new Date(),
      rejection_reason: rejection_reason || 'Tidak ada alasan yang diberikan'
    });

    // Get updated request with details
    const requestWithDetails = await GoodOutRequestModel.findById(Number(id));

    // Emit notification
    io.emit('good_out_request_rejected', {
      request: requestWithDetails,
      message: `Permintaan good out ditolak oleh ${req.user.nama_lengkap}`
    });

    res.json({
      success: true,
      message: 'Permintaan berhasil ditolak',
      data: requestWithDetails
    });
  });

  // @desc    Get pending requests count
  // @route   GET /api/good-out-requests/pending/count
  // @access  Private (admin, manager)
  static getPendingCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Check permission
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }

    const count = await GoodOutRequestModel.getPendingCount();

    res.json({
      success: true,
      data: { pending_count: count }
    });
  });

  // @desc    Cancel own request (teknisi only)
  // @route   DELETE /api/good-out-requests/:id
  // @access  Private (teknisi - own requests only)
  static cancelRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const request = await GoodOutRequestModel.findById(Number(id));
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan tidak ditemukan'
      });
    }

    // Check if user can cancel this request
    if (req.user?.role === 'teknisi' && request.requested_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda hanya dapat membatalkan permintaan Anda sendiri'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Permintaan yang sudah diproses tidak dapat dibatalkan'
      });
    }

    // Update status to rejected with cancellation note
    await GoodOutRequestModel.update(Number(id), {
      status: 'rejected',
      rejection_reason: 'Dibatalkan oleh teknisi'
    });

    res.json({
      success: true,
      message: 'Permintaan berhasil dibatalkan'
    });
  });
}
