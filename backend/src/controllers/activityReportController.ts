import { Request, Response } from 'express';
import { ActivityReportModel } from '../models/ActivityReport';
import { UserModel } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    username: string;
  };
}

export class ActivityReportController {
  // @desc    Create new activity report
  // @route   POST /api/activity-reports
  // @access  Private (teknisi, sales)
  static async createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        tanggal_laporan,
        jenis_kegiatan,
        judul_kegiatan,
        deskripsi_kegiatan,
        lokasi,
        customer_name,
        customer_contact,
        waktu_mulai,
        waktu_selesai,
        durasi_menit,
        status = 'pending',
        hasil = 'pending',
        catatan_hasil,
        peralatan_digunakan,
        material_digunakan,
        biaya_material,
        biaya_transport,
        target_penjualan,
        realisasi_penjualan,
        prospek_baru,
        follow_up_count,
        foto_dokumentasi,
        dokumen_pendukung,
        prioritas = 'sedang',
        kendala_hambatan,
        rencana_tindak_lanjut
      } = req.body;

      // Validate required fields
      if (!tanggal_laporan || !jenis_kegiatan || !judul_kegiatan || !deskripsi_kegiatan) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal laporan, jenis kegiatan, judul, dan deskripsi wajib diisi'
        });
      }

      // Check if user has permission (only teknisi and sales can create reports)
      if (!req.user || !['teknisi', 'sales'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya teknisi dan sales yang dapat membuat laporan kegiatan.'
        });
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(tanggal_laporan)) {
        return res.status(400).json({
          success: false,
          message: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'
        });
      }

      // Validate jenis_kegiatan
      const validJenisKegiatan = ['instalasi', 'maintenance', 'troubleshooting', 'survey', 'presentasi', 'follow_up', 'kunjungan_customer', 'training', 'meeting', 'lainnya'];
      if (!validJenisKegiatan.includes(jenis_kegiatan)) {
        return res.status(400).json({
          success: false,
          message: 'Jenis kegiatan tidak valid'
        });
      }

      const reportData = {
        user_id: req.user.id,
        tanggal_laporan,
        jenis_kegiatan,
        judul_kegiatan,
        deskripsi_kegiatan,
        lokasi,
        customer_name,
        customer_contact,
        waktu_mulai,
        waktu_selesai,
        durasi_menit,
        status,
        hasil,
        catatan_hasil,
        peralatan_digunakan: peralatan_digunakan || [],
        material_digunakan: material_digunakan || [],
        biaya_material: biaya_material || 0,
        biaya_transport: biaya_transport || 0,
        target_penjualan: target_penjualan || 0,
        realisasi_penjualan: realisasi_penjualan || 0,
        prospek_baru: prospek_baru || 0,
        follow_up_count: follow_up_count || 0,
        foto_dokumentasi: foto_dokumentasi || [],
        dokumen_pendukung: dokumen_pendukung || [],
        prioritas,
        kendala_hambatan,
        rencana_tindak_lanjut,
        status_approval: 'draft'
      };

      const report = await ActivityReportModel.create(reportData);

      res.status(201).json({
        success: true,
        message: 'Laporan kegiatan berhasil dibuat',
        data: report
      });
    } catch (error) {
      console.error('Error creating activity report:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat laporan kegiatan'
      });
    }
  }

  // @desc    Get all activity reports with filters
  // @route   GET /api/activity-reports
  // @access  Private
  static async getAllReports(req: AuthenticatedRequest, res: Response) {
    try {
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
      } = req.query;

      let filters: any = {
        page: Number(page),
        limit: Number(limit)
      };

      // Role-based access control
      if (req.user?.role === 'teknisi' || req.user?.role === 'sales') {
        // Teknisi dan sales hanya bisa melihat laporan mereka sendiri
        filters.user_id = req.user.id;
      } else if (req.user?.role === 'manager') {
        // Manager bisa melihat semua laporan teknisi dan sales
        if (user_id) filters.user_id = Number(user_id);
        if (role) filters.role = role as string;
      } else if (req.user?.role === 'admin') {
        // Admin bisa melihat semua laporan
        if (user_id) filters.user_id = Number(user_id);
        if (role) filters.role = role as string;
      }

      // Apply other filters
      if (jenis_kegiatan) filters.jenis_kegiatan = jenis_kegiatan as string;
      if (status) filters.status = status as string;
      if (status_approval) filters.status_approval = status_approval as string;
      if (tanggal_dari) filters.tanggal_dari = tanggal_dari as string;
      if (tanggal_sampai) filters.tanggal_sampai = tanggal_sampai as string;
      if (search) filters.search = search as string;

      const result = await ActivityReportModel.findAll(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting activity reports:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data laporan kegiatan'
      });
    }
  }

  // @desc    Get activity report by ID
  // @route   GET /api/activity-reports/:id
  // @access  Private
  static async getReportById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const report = await ActivityReportModel.findById(Number(id));

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Laporan kegiatan tidak ditemukan'
        });
      }

      // Check access permission
      if (req.user?.role === 'teknisi' || req.user?.role === 'sales') {
        if (report.user_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda hanya dapat melihat laporan kegiatan Anda sendiri.'
          });
        }
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error getting activity report:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data laporan kegiatan'
      });
    }
  }

  // @desc    Update activity report
  // @route   PUT /api/activity-reports/:id
  // @access  Private (owner, admin, manager)
  static async updateReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const existingReport = await ActivityReportModel.findById(Number(id));

      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: 'Laporan kegiatan tidak ditemukan'
        });
      }

      // Check permission
      const canEdit = 
        req.user?.role === 'admin' ||
        req.user?.role === 'manager' ||
        (req.user?.id === existingReport.user_id && existingReport.status_approval === 'draft');

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda tidak dapat mengedit laporan ini.'
        });
      }

      const updateData = { ...req.body };
      delete updateData.user_id; // Prevent changing user_id
      delete updateData.status_approval; // Prevent direct status_approval change

      const updatedReport = await ActivityReportModel.update(Number(id), updateData);

      if (!updatedReport) {
        return res.status(400).json({
          success: false,
          message: 'Gagal mengupdate laporan kegiatan'
        });
      }

      res.json({
        success: true,
        message: 'Laporan kegiatan berhasil diupdate',
        data: updatedReport
      });
    } catch (error) {
      console.error('Error updating activity report:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate laporan kegiatan'
      });
    }
  }

  // @desc    Submit report for approval
  // @route   POST /api/activity-reports/:id/submit
  // @access  Private (owner)
  static async submitReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const existingReport = await ActivityReportModel.findById(Number(id));

      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: 'Laporan kegiatan tidak ditemukan'
        });
      }

      // Check permission (only owner can submit)
      if (req.user?.id !== existingReport.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda hanya dapat submit laporan kegiatan Anda sendiri.'
        });
      }

      // Check if already submitted
      if (existingReport.status_approval !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Laporan sudah disubmit atau sudah diproses'
        });
      }

      const updatedReport = await ActivityReportModel.submitForApproval(Number(id));

      res.json({
        success: true,
        message: 'Laporan kegiatan berhasil disubmit untuk approval',
        data: updatedReport
      });
    } catch (error) {
      console.error('Error submitting activity report:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat submit laporan kegiatan'
      });
    }
  }

  // @desc    Approve or reject report
  // @route   POST /api/activity-reports/:id/approval
  // @access  Private (admin, manager)
  static async approveReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, catatan } = req.body;

      // Check permission
      if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya admin dan manager yang dapat approve laporan.'
        });
      }

      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status approval harus "approved" atau "rejected"'
        });
      }

      const existingReport = await ActivityReportModel.findById(Number(id));
      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: 'Laporan kegiatan tidak ditemukan'
        });
      }

      if (existingReport.status_approval !== 'submitted') {
        return res.status(400).json({
          success: false,
          message: 'Laporan belum disubmit untuk approval'
        });
      }

      const updatedReport = await ActivityReportModel.updateApprovalStatus(
        Number(id),
        status,
        req.user.id,
        catatan
      );

      res.json({
        success: true,
        message: `Laporan kegiatan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
        data: updatedReport
      });
    } catch (error) {
      console.error('Error approving activity report:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memproses approval'
      });
    }
  }

  // @desc    Delete activity report
  // @route   DELETE /api/activity-reports/:id
  // @access  Private (admin, manager, owner if draft)
  static async deleteReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const existingReport = await ActivityReportModel.findById(Number(id));

      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: 'Laporan kegiatan tidak ditemukan'
        });
      }

      // Check permission
      const canDelete = 
        req.user?.role === 'admin' ||
        req.user?.role === 'manager' ||
        (req.user?.id === existingReport.user_id && existingReport.status_approval === 'draft');

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda tidak dapat menghapus laporan ini.'
        });
      }

      const deleted = await ActivityReportModel.delete(Number(id));

      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Gagal menghapus laporan kegiatan'
        });
      }

      res.json({
        success: true,
        message: 'Laporan kegiatan berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting activity report:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus laporan kegiatan'
      });
    }
  }

  // @desc    Get activity reports statistics
  // @route   GET /api/activity-reports/statistics
  // @access  Private
  static async getStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { user_id, role, date_from, date_to } = req.query;

      let filters: any = {};

      // Role-based access control
      if (req.user?.role === 'teknisi' || req.user?.role === 'sales') {
        // Teknisi dan sales hanya bisa melihat statistik mereka sendiri
        filters.userId = req.user.id;
      } else if (req.user?.role === 'manager' || req.user?.role === 'admin') {
        // Manager dan admin bisa melihat statistik semua atau filter tertentu
        if (user_id) filters.userId = Number(user_id);
        if (role) filters.role = role as string;
      }

      if (date_from) filters.dateFrom = date_from as string;
      if (date_to) filters.dateTo = date_to as string;

      const statistics = await ActivityReportModel.getStatistics(
        filters.userId,
        filters.role,
        filters.dateFrom,
        filters.dateTo
      );

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting activity reports statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik laporan kegiatan'
      });
    }
  }
}
