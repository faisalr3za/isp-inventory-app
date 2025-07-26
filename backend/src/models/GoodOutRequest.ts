import { db } from '../config/database';

export interface GoodOutRequest {
  id?: number;
  item_id: number;
  requested_by: number;
  approved_by?: number;
  quantity: number;
  reason: string;
  notes?: string;
  customer_info?: {
    name?: string;
    phone?: string;
    address?: string;
    order_id?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejection_reason?: string;
  requested_at?: Date;
  approved_at?: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  
  // Relations
  item?: {
    id: number;
    nama_barang: string;
    sku: string;
    stok: number;
    lokasi_gudang?: string;
  };
  requester?: {
    id: number;
    nama_lengkap: string;
    username: string;
    role: string;
  };
  approver?: {
    id: number;
    nama_lengkap: string;
    username: string;
    role: string;
  };
}

export interface CreateGoodOutRequestData {
  item_id: number;
  requested_by: number;
  quantity: number;
  reason: string;
  notes?: string;
  customer_info?: {
    name?: string;
    phone?: string;
    address?: string;
    order_id?: string;
  };
}

export interface UpdateGoodOutRequestData {
  approved_by?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  rejection_reason?: string;
  approved_at?: Date;
  completed_at?: Date;
}

export class GoodOutRequestModel {
  // Create new good out request
  static async create(requestData: CreateGoodOutRequestData): Promise<GoodOutRequest> {
    const [request] = await db('good_out_requests')
      .insert({
        ...requestData,
        customer_info: requestData.customer_info ? JSON.stringify(requestData.customer_info) : null,
        status: 'pending'
      })
      .returning('*');
    
    return {
      ...request,
      customer_info: request.customer_info ? JSON.parse(request.customer_info) : null
    };
  }

  // Find request by ID with relations
  static async findById(id: number): Promise<GoodOutRequest | null> {
    const request = await db('good_out_requests')
      .select(
        'good_out_requests.*',
        'inventory_items.nama_barang',
        'inventory_items.sku',
        'inventory_items.stok',
        'inventory_items.lokasi_gudang',
        'requester.nama_lengkap as requester_name',
        'requester.username as requester_username',
        'requester.role as requester_role',
        'approver.nama_lengkap as approver_name',
        'approver.username as approver_username',
        'approver.role as approver_role'
      )
      .leftJoin('inventory_items', 'good_out_requests.item_id', 'inventory_items.id')
      .leftJoin('users as requester', 'good_out_requests.requested_by', 'requester.id')
      .leftJoin('users as approver', 'good_out_requests.approved_by', 'approver.id')
      .where('good_out_requests.id', id)
      .first();

    if (!request) return null;

    return {
      ...request,
      customer_info: request.customer_info ? JSON.parse(request.customer_info) : null,
      item: {
        id: request.item_id,
        nama_barang: request.nama_barang,
        sku: request.sku,
        stok: request.stok,
        lokasi_gudang: request.lokasi_gudang
      },
      requester: request.requester_name ? {
        id: request.requested_by,
        nama_lengkap: request.requester_name,
        username: request.requester_username,
        role: request.requester_role
      } : undefined,
      approver: request.approver_name ? {
        id: request.approved_by,
        nama_lengkap: request.approver_name,
        username: request.approver_username,
        role: request.approver_role
      } : undefined
    };
  }

  // Get all requests with pagination and filters
  static async findAll(options: {
    page?: number;
    limit?: number;
    status?: string;
    requested_by?: number;
    approved_by?: number;
    item_id?: number;
  } = {}): Promise<{
    requests: GoodOutRequest[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      requested_by,
      approved_by,
      item_id
    } = options;

    const offset = (page - 1) * limit;

    let query = db('good_out_requests')
      .select(
        'good_out_requests.*',
        'inventory_items.nama_barang',
        'inventory_items.sku',
        'inventory_items.stok',
        'inventory_items.lokasi_gudang',
        'requester.nama_lengkap as requester_name',
        'requester.username as requester_username',
        'requester.role as requester_role',
        'approver.nama_lengkap as approver_name',
        'approver.username as approver_username',
        'approver.role as approver_role'
      )
      .leftJoin('inventory_items', 'good_out_requests.item_id', 'inventory_items.id')
      .leftJoin('users as requester', 'good_out_requests.requested_by', 'requester.id')
      .leftJoin('users as approver', 'good_out_requests.approved_by', 'approver.id');

    // Apply filters
    if (status) {
      query = query.where('good_out_requests.status', status);
    }
    if (requested_by) {
      query = query.where('good_out_requests.requested_by', requested_by);
    }
    if (approved_by) {
      query = query.where('good_out_requests.approved_by', approved_by);
    }
    if (item_id) {
      query = query.where('good_out_requests.item_id', item_id);
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('good_out_requests.id as count');
    const total = Number(count);

    // Get paginated results
    const requests = await query
      .orderBy('good_out_requests.requested_at', 'desc')
      .limit(limit)
      .offset(offset);

    const transformedRequests = requests.map(request => ({
      ...request,
      customer_info: request.customer_info ? JSON.parse(request.customer_info) : null,
      item: {
        id: request.item_id,
        nama_barang: request.nama_barang,
        sku: request.sku,
        stok: request.stok,
        lokasi_gudang: request.lokasi_gudang
      },
      requester: request.requester_name ? {
        id: request.requested_by,
        nama_lengkap: request.requester_name,
        username: request.requester_username,
        role: request.requester_role
      } : undefined,
      approver: request.approver_name ? {
        id: request.approved_by,
        nama_lengkap: request.approver_name,
        username: request.approver_username,
        role: request.approver_role
      } : undefined
    }));

    return {
      requests: transformedRequests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  // Update request
  static async update(id: number, updateData: UpdateGoodOutRequestData): Promise<GoodOutRequest | null> {
    const [request] = await db('good_out_requests')
      .where('id', id)
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    if (!request) return null;

    return {
      ...request,
      customer_info: request.customer_info ? JSON.parse(request.customer_info) : null
    };
  }

  // Get pending requests count for notifications
  static async getPendingCount(): Promise<number> {
    const [{ count }] = await db('good_out_requests')
      .where('status', 'pending')
      .count('id as count');
    
    return Number(count);
  }

  // Get requests by status
  static async findByStatus(status: string): Promise<GoodOutRequest[]> {
    const requests = await db('good_out_requests')
      .select(
        'good_out_requests.*',
        'inventory_items.nama_barang',
        'inventory_items.sku',
        'requester.nama_lengkap as requester_name'
      )
      .leftJoin('inventory_items', 'good_out_requests.item_id', 'inventory_items.id')
      .leftJoin('users as requester', 'good_out_requests.requested_by', 'requester.id')
      .where('good_out_requests.status', status)
      .orderBy('good_out_requests.requested_at', 'desc');

    return requests.map(request => ({
      ...request,
      customer_info: request.customer_info ? JSON.parse(request.customer_info) : null,
      item: {
        id: request.item_id,
        nama_barang: request.nama_barang,
        sku: request.sku
      },
      requester: {
        id: request.requested_by,
        nama_lengkap: request.requester_name
      }
    }));
  }
}
