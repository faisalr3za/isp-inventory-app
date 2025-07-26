import { db } from '../config/database';

export interface ActivityReport {
  id?: number;
  user_id: number;
  tanggal_laporan: string;
  jenis_kegiatan: 'instalasi' | 'maintenance' | 'troubleshooting' | 'survey' | 'presentasi' | 'follow_up' | 'kunjungan_customer' | 'training' | 'meeting' | 'lainnya';
  judul_kegiatan: string;
  deskripsi_kegiatan: string;
  lokasi?: string;
  customer_name?: string;
  customer_contact?: string;
  
  // Waktu kegiatan
  waktu_mulai?: string;
  waktu_selesai?: string;
  durasi_menit?: number;
  
  // Status dan hasil
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  hasil: 'berhasil' | 'gagal' | 'partial' | 'pending';
  catatan_hasil?: string;
  
  // Untuk teknisi
  peralatan_digunakan?: string[]; // akan disimpan sebagai JSON
  material_digunakan?: string[]; // akan disimpan sebagai JSON
  biaya_material?: number;
  biaya_transport?: number;
  
  // Untuk sales
  target_penjualan?: number;
  realisasi_penjualan?: number;
  prospek_baru?: number;
  follow_up_count?: number;
  
  // File attachment
  foto_dokumentasi?: string[]; // akan disimpan sebagai JSON
  dokumen_pendukung?: string[]; // akan disimpan sebagai JSON
  
  // Priority dan urgency
  prioritas: 'rendah' | 'sedang' | 'tinggi' | 'urgent';
  kendala_hambatan?: string;
  rencana_tindak_lanjut?: string;
  
  // Approval workflow
  status_approval: 'draft' | 'submitted' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: Date;
  catatan_approval?: string;
  
  created_at?: Date;
  updated_at?: Date;
  
  // Joined fields
  user_nama?: string;
  user_role?: string;
  approver_nama?: string;
}

export interface ActivityReportWithUser extends ActivityReport {
  user: {
    id: number;
    nama_lengkap: string;
    role: string;
    no_telp?: string;
  };
  approver?: {
    id: number;
    nama_lengkap: string;
  };
}

export class ActivityReportModel {
  // Create laporan kegiatan baru
  static async create(reportData: Omit<ActivityReport, 'id' | 'created_at' | 'updated_at'>): Promise<ActivityReport> {
    // Convert arrays to JSON strings
    const dataToInsert = {
      ...reportData,
      peralatan_digunakan: reportData.peralatan_digunakan ? JSON.stringify(reportData.peralatan_digunakan) : null,
      material_digunakan: reportData.material_digunakan ? JSON.stringify(reportData.material_digunakan) : null,
      foto_dokumentasi: reportData.foto_dokumentasi ? JSON.stringify(reportData.foto_dokumentasi) : null,
      dokumen_pendukung: reportData.dokumen_pendukung ? JSON.stringify(reportData.dokumen_pendukung) : null,
    };

    const [report] = await db('activity_reports')
      .insert(dataToInsert)
      .returning('*');
    
    return this.parseJsonFields(report);
  }

  // Get laporan by ID dengan join user data
  static async findById(id: number): Promise<ActivityReportWithUser | null> {
    const report = await db('activity_reports')
      .select(
        'activity_reports.*',
        'users.nama_lengkap as user_nama',
        'users.role as user_role',
        'users.no_telp as user_no_telp',
        'approver.nama_lengkap as approver_nama'
      )
      .leftJoin('users', 'activity_reports.user_id', 'users.id')
      .leftJoin('users as approver', 'activity_reports.approved_by', 'approver.id')
      .where('activity_reports.id', id)
      .first();

    if (!report) return null;

    return this.formatReportWithUser(report);
  }

  // Get all laporan dengan filter dan pagination
  static async findAll(filters: {
    page?: number;
    limit?: number;
    user_id?: number;
    role?: string;
    jenis_kegiatan?: string;
    status?: string;
    status_approval?: string;
    tanggal_dari?: string;
    tanggal_sampai?: string;
    search?: string;
  } = {}): Promise<{
    reports: ActivityReportWithUser[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 10,
      user_id,
      role,
      jenis_kegiatan,
      status,
      status_approval,
      tanggal_dari,
      tanggal_sampai,
      search
    } = filters;

    let query = db('activity_reports')
      .select(
        'activity_reports.*',
        'users.nama_lengkap as user_nama',
        'users.role as user_role',
        'users.no_telp as user_no_telp',
        'approver.nama_lengkap as approver_nama'
      )
      .leftJoin('users', 'activity_reports.user_id', 'users.id')
      .leftJoin('users as approver', 'activity_reports.approved_by', 'approver.id');

    // Apply filters
    if (user_id) {
      query = query.where('activity_reports.user_id', user_id);
    }

    if (role) {
      query = query.where('users.role', role);
    }

    if (jenis_kegiatan) {
      query = query.where('activity_reports.jenis_kegiatan', jenis_kegiatan);
    }

    if (status) {
      query = query.where('activity_reports.status', status);
    }

    if (status_approval) {
      query = query.where('activity_reports.status_approval', status_approval);
    }

    if (tanggal_dari) {
      query = query.where('activity_reports.tanggal_laporan', '>=', tanggal_dari);
    }

    if (tanggal_sampai) {
      query = query.where('activity_reports.tanggal_laporan', '<=', tanggal_sampai);
    }

    if (search) {
      query = query.where(function() {
        this.where('activity_reports.judul_kegiatan', 'ilike', `%${search}%`)
            .orWhere('activity_reports.deskripsi_kegiatan', 'ilike', `%${search}%`)
            .orWhere('activity_reports.lokasi', 'ilike', `%${search}%`)
            .orWhere('activity_reports.customer_name', 'ilike', `%${search}%`)
            .orWhere('users.nama_lengkap', 'ilike', `%${search}%`);
      });
    }

    // Get total count
    const total = await query.clone().count('activity_reports.id as count').first();
    
    // Get paginated results
    const reports = await query
      .orderBy('activity_reports.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      reports: reports.map(report => this.formatReportWithUser(report)),
      total: Number(total?.count) || 0,
      totalPages: Math.ceil((Number(total?.count) || 0) / limit),
      currentPage: page
    };
  }

  // Update laporan kegiatan
  static async update(id: number, updateData: Partial<ActivityReport>): Promise<ActivityReport | null> {
    // Convert arrays to JSON strings
    const dataToUpdate = {
      ...updateData,
      peralatan_digunakan: updateData.peralatan_digunakan ? JSON.stringify(updateData.peralatan_digunakan) : undefined,
      material_digunakan: updateData.material_digunakan ? JSON.stringify(updateData.material_digunakan) : undefined,
      foto_dokumentasi: updateData.foto_dokumentasi ? JSON.stringify(updateData.foto_dokumentasi) : undefined,
      dokumen_pendukung: updateData.dokumen_pendukung ? JSON.stringify(updateData.dokumen_pendukung) : undefined,
      updated_at: new Date()
    };

    // Remove undefined values
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
        delete dataToUpdate[key as keyof typeof dataToUpdate];
      }
    });

    const [report] = await db('activity_reports')
      .where({ id })
      .update(dataToUpdate)
      .returning('*');

    return report ? this.parseJsonFields(report) : null;
  }

  // Approve/reject laporan
  static async updateApprovalStatus(
    id: number, 
    status: 'approved' | 'rejected', 
    approvedBy: number, 
    catatan?: string
  ): Promise<ActivityReport | null> {
    const [report] = await db('activity_reports')
      .where({ id })
      .update({
        status_approval: status,
        approved_by: approvedBy,
        approved_at: new Date(),
        catatan_approval: catatan,
        updated_at: new Date()
      })
      .returning('*');

    return report ? this.parseJsonFields(report) : null;
  }

  // Submit laporan untuk approval
  static async submitForApproval(id: number): Promise<ActivityReport | null> {
    const [report] = await db('activity_reports')
      .where({ id })
      .update({
        status_approval: 'submitted',
        updated_at: new Date()
      })
      .returning('*');

    return report ? this.parseJsonFields(report) : null;
  }

  // Delete laporan (hard delete)
  static async delete(id: number): Promise<boolean> {
    const result = await db('activity_reports')
      .where({ id })
      .del();

    return result > 0;
  }

  // Get laporan statistics untuk dashboard
  static async getStatistics(userId?: number, role?: string, dateFrom?: string, dateTo?: string) {
    let query = db('activity_reports')
      .leftJoin('users', 'activity_reports.user_id', 'users.id');

    if (userId) {
      query = query.where('activity_reports.user_id', userId);
    }

    if (role) {
      query = query.where('users.role', role);
    }

    if (dateFrom) {
      query = query.where('activity_reports.tanggal_laporan', '>=', dateFrom);
    }

    if (dateTo) {
      query = query.where('activity_reports.tanggal_laporan', '<=', dateTo);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_laporan'),
        db.raw('COUNT(CASE WHEN status = \'completed\' THEN 1 END) as selesai'),
        db.raw('COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending'),
        db.raw('COUNT(CASE WHEN status = \'in_progress\' THEN 1 END) as dalam_proses'),
        db.raw('COUNT(CASE WHEN status_approval = \'approved\' THEN 1 END) as disetujui'),
        db.raw('COUNT(CASE WHEN status_approval = \'submitted\' THEN 1 END) as menunggu_approval'),
        db.raw('AVG(durasi_menit) as rata_rata_durasi'),
        db.raw('SUM(biaya_material) as total_biaya_material'),
        db.raw('SUM(biaya_transport) as total_biaya_transport'),
        db.raw('SUM(realisasi_penjualan) as total_penjualan'),
        db.raw('AVG(realisasi_penjualan) as rata_rata_penjualan')
      )
      .first();

    return stats;
  }

  // Helper method to parse JSON fields
  private static parseJsonFields(report: any): ActivityReport {
    return {
      ...report,
      peralatan_digunakan: report.peralatan_digunakan ? JSON.parse(report.peralatan_digunakan) : [],
      material_digunakan: report.material_digunakan ? JSON.parse(report.material_digunakan) : [],
      foto_dokumentasi: report.foto_dokumentasi ? JSON.parse(report.foto_dokumentasi) : [],
      dokumen_pendukung: report.dokumen_pendukung ? JSON.parse(report.dokumen_pendukung) : []
    };
  }

  // Helper method to format report with user data
  private static formatReportWithUser(report: any): ActivityReportWithUser {
    const parsedReport = this.parseJsonFields(report);
    
    return {
      ...parsedReport,
      user: {
        id: report.user_id,
        nama_lengkap: report.user_nama,
        role: report.user_role,
        no_telp: report.user_no_telp
      },
      approver: report.approver_nama ? {
        id: report.approved_by,
        nama_lengkap: report.approver_nama
      } : undefined
    };
  }
}
