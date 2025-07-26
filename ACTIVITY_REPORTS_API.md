# Activity Reports API Documentation

## Overview
API untuk mengelola laporan kegiatan teknisi dan sales dengan fitur approval workflow, filtering, dan statistik.

## Base URL
```
http://localhost:3000/api/activity-reports
```

## Authentication
Semua endpoint memerlukan Bearer token di header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Activity Report
**POST** `/`

Membuat laporan kegiatan baru (hanya teknisi dan sales).

**Request Body:**
```json
{
  "tanggal_laporan": "2024-12-01",
  "jenis_kegiatan": "instalasi",
  "judul_kegiatan": "Instalasi Internet Fiber PT ABC",
  "deskripsi_kegiatan": "Melakukan instalasi internet fiber 100 Mbps...",
  "lokasi": "Jl. Sudirman No. 123, Jakarta",
  "customer_name": "PT ABC Technology",
  "customer_contact": "021-1234567",
  "waktu_mulai": "09:00",
  "waktu_selesai": "15:00",
  "durasi_menit": 360,
  "status": "pending",
  "hasil": "pending",
  "catatan_hasil": "Instalasi berjalan lancar",
  "peralatan_digunakan": ["Fusion Splicer", "OTDR", "Power Meter"],
  "material_digunakan": ["Connector SC/APC", "Cable Tie"],
  "biaya_material": 150000,
  "biaya_transport": 50000,
  "target_penjualan": 50000000,
  "realisasi_penjualan": 0,
  "prospek_baru": 1,
  "follow_up_count": 1,
  "foto_dokumentasi": ["install_before.jpg", "install_after.jpg"],
  "dokumen_pendukung": ["proposal.pdf"],
  "prioritas": "tinggi",
  "kendala_hambatan": "Tidak ada kendala",
  "rencana_tindak_lanjut": "Follow up dalam 1 minggu"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Laporan kegiatan berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": 2,
    "tanggal_laporan": "2024-12-01",
    "jenis_kegiatan": "instalasi",
    "judul_kegiatan": "Instalasi Internet Fiber PT ABC",
    "status_approval": "draft",
    "created_at": "2024-12-01T10:00:00.000Z"
  }
}
```

### 2. Get All Activity Reports
**GET** `/`

Mengambil semua laporan kegiatan dengan filtering dan pagination.

**Query Parameters:**
- `page` (number): Halaman (default: 1)
- `limit` (number): Jumlah per halaman (default: 10)
- `user_id` (number): Filter berdasarkan user ID
- `role` (string): Filter berdasarkan role (teknisi/sales)
- `jenis_kegiatan` (string): Filter berdasarkan jenis kegiatan
- `status` (string): Filter berdasarkan status (pending/in_progress/completed/cancelled)
- `status_approval` (string): Filter berdasarkan status approval (draft/submitted/approved/rejected)
- `tanggal_dari` (date): Filter tanggal mulai
- `tanggal_sampai` (date): Filter tanggal akhir
- `search` (string): Pencarian teks

**Example:**
```
GET /api/activity-reports?page=1&limit=10&role=teknisi&status=completed
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "user_id": 2,
        "tanggal_laporan": "2024-12-01",
        "jenis_kegiatan": "instalasi",
        "judul_kegiatan": "Instalasi Internet Fiber PT ABC",
        "deskripsi_kegiatan": "Melakukan instalasi...",
        "status": "completed",
        "hasil": "berhasil",
        "status_approval": "approved",
        "user": {
          "id": 2,
          "nama_lengkap": "John Teknisi",
          "role": "teknisi",
          "no_telp": "08123456789"
        },
        "approver": {
          "id": 1,
          "nama_lengkap": "Admin User"
        },
        "created_at": "2024-12-01T10:00:00.000Z"
      }
    ],
    "total": 15,
    "totalPages": 2,
    "currentPage": 1
  }
}
```

### 3. Get Activity Report by ID
**GET** `/:id`

Mengambil detail laporan kegiatan berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 2,
    "tanggal_laporan": "2024-12-01",
    "jenis_kegiatan": "instalasi",
    "judul_kegiatan": "Instalasi Internet Fiber PT ABC",
    "deskripsi_kegiatan": "Melakukan instalasi internet fiber...",
    "lokasi": "Jl. Sudirman No. 123, Jakarta",
    "customer_name": "PT ABC Technology",
    "customer_contact": "021-1234567",
    "waktu_mulai": "09:00",
    "waktu_selesai": "15:00",
    "durasi_menit": 360,
    "status": "completed",
    "hasil": "berhasil",
    "catatan_hasil": "Instalasi berhasil",
    "peralatan_digunakan": ["Fusion Splicer", "OTDR"],
    "material_digunakan": ["Connector SC/APC"],
    "biaya_material": 150000,
    "biaya_transport": 50000,
    "foto_dokumentasi": ["install_before.jpg"],
    "prioritas": "tinggi",
    "kendala_hambatan": "Tidak ada kendala",
    "rencana_tindak_lanjut": "Follow up dalam 1 minggu",
    "status_approval": "approved",
    "approved_at": "2024-12-01T16:00:00.000Z",
    "user": {
      "id": 2,
      "nama_lengkap": "John Teknisi",
      "role": "teknisi"
    },
    "approver": {
      "id": 1,
      "nama_lengkap": "Admin User"
    }
  }
}
```

### 4. Update Activity Report
**PUT** `/:id`

Mengupdate laporan kegiatan (hanya pemilik jika draft, admin, atau manager).

**Request Body:** (sama seperti create, semua field opsional)
```json
{
  "status": "completed",
  "hasil": "berhasil",
  "catatan_hasil": "Update hasil kegiatan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Laporan kegiatan berhasil diupdate",
  "data": {
    "id": 1,
    "status": "completed",
    "hasil": "berhasil",
    "updated_at": "2024-12-01T17:00:00.000Z"
  }
}
```

### 5. Submit Report for Approval
**POST** `/:id/submit`

Submit laporan untuk approval (hanya pemilik laporan).

**Response:**
```json
{
  "success": true,
  "message": "Laporan kegiatan berhasil disubmit untuk approval",
  "data": {
    "id": 1,
    "status_approval": "submitted",
    "updated_at": "2024-12-01T17:00:00.000Z"
  }
}
```

### 6. Approve/Reject Report
**POST** `/:id/approval`

Approve atau reject laporan (hanya admin dan manager).

**Request Body:**
```json
{
  "status": "approved",
  "catatan": "Laporan lengkap dan sesuai standar"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Laporan kegiatan berhasil disetujui",
  "data": {
    "id": 1,
    "status_approval": "approved",
    "approved_by": 1,
    "approved_at": "2024-12-01T18:00:00.000Z",
    "catatan_approval": "Laporan lengkap dan sesuai standar"
  }
}
```

### 7. Delete Activity Report
**DELETE** `/:id`

Menghapus laporan kegiatan (admin, manager, atau pemilik jika draft).

**Response:**
```json
{
  "success": true,
  "message": "Laporan kegiatan berhasil dihapus"
}
```

### 8. Get Statistics
**GET** `/statistics`

Mengambil statistik laporan kegiatan.

**Query Parameters:**
- `user_id` (number): Filter berdasarkan user ID
- `role` (string): Filter berdasarkan role
- `date_from` (date): Filter tanggal mulai
- `date_to` (date): Filter tanggal akhir

**Response:**
```json
{
  "success": true,
  "data": {
    "total_laporan": "25",
    "selesai": "20",
    "pending": "3",
    "dalam_proses": "2",
    "disetujui": "18",
    "menunggu_approval": "5",
    "rata_rata_durasi": "180.5",
    "total_biaya_material": "2500000.00",
    "total_biaya_transport": "750000.00",
    "total_penjualan": "150000000.00",
    "rata_rata_penjualan": "7500000.00"
  }
}
```

## Jenis Kegiatan yang Tersedia
- `instalasi` - Instalasi perangkat/layanan
- `maintenance` - Maintenance rutin
- `troubleshooting` - Pemecahan masalah
- `survey` - Survey lokasi
- `presentasi` - Presentasi ke customer
- `follow_up` - Follow up customer
- `kunjungan_customer` - Kunjungan ke customer
- `training` - Pelatihan
- `meeting` - Meeting
- `lainnya` - Kegiatan lainnya

## Status Kegiatan
- `pending` - Belum dimulai
- `in_progress` - Sedang berlangsung
- `completed` - Selesai
- `cancelled` - Dibatalkan

## Hasil Kegiatan
- `berhasil` - Berhasil
- `gagal` - Gagal
- `partial` - Sebagian berhasil
- `pending` - Belum ada hasil

## Status Approval
- `draft` - Draft (belum disubmit)
- `submitted` - Sudah disubmit, menunggu approval
- `approved` - Disetujui
- `rejected` - Ditolak

## Prioritas
- `rendah` - Prioritas rendah
- `sedang` - Prioritas sedang
- `tinggi` - Prioritas tinggi
- `urgent` - Urgent

## Role-based Access Control

### Teknisi & Sales
- Dapat membuat laporan kegiatan sendiri
- Dapat melihat dan mengedit laporan sendiri (jika status draft)
- Dapat submit laporan sendiri untuk approval
- Dapat melihat statistik laporan sendiri

### Manager
- Dapat melihat semua laporan kegiatan teknisi dan sales
- Dapat approve/reject laporan
- Dapat melihat statistik semua laporan

### Admin
- Akses penuh ke semua fitur
- Dapat mengedit dan menghapus semua laporan
- Dapat approve/reject laporan
- Dapat melihat statistik semua laporan

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Tanggal laporan, jenis kegiatan, judul, dan deskripsi wajib diisi"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token diperlukan"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akses ditolak. Hanya teknisi dan sales yang dapat membuat laporan kegiatan."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Laporan kegiatan tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan saat memproses request"
}
```
