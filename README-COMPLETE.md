# ISP Inventory Management System

Sistem manajemen inventori untuk penyedia layanan internet (ISP) dengan fitur laporan kegiatan teknisi dan sales.

## 🎯 Fitur Utama

### Untuk Admin Gudang
- ✅ Manajemen inventori barang (CRUD)
- ✅ Tracking stok masuk dan keluar
- ✅ Laporan inventori real-time
- ✅ Manajemen kategori dan supplier
- ✅ Dashboard analitik gudang

### Untuk Teknisi
- ✅ Buat laporan kegiatan harian
- ✅ Upload foto dokumentasi pekerjaan
- ✅ Tracking peralatan dan material yang digunakan
- ✅ Laporan troubleshooting dan maintenance
- ✅ Submit laporan untuk approval

### Untuk Sales
- ✅ Laporan kegiatan penjualan
- ✅ Tracking target dan realisasi penjualan
- ✅ Follow-up customer
- ✅ Upload dokumen proposal dan kontrak
- ✅ Dashboard performa sales

### Untuk Manager
- ✅ Approve/reject laporan kegiatan
- ✅ Dashboard overview semua aktivitas
- ✅ Laporan analitik tim
- ✅ Monitor produktivitas teknisi dan sales

## 🚀 Quick Start

### Menggunakan Docker (Recommended)

1. **Clone repository:**
```bash
git clone <repository-url>
cd isp-inventory-app
```

2. **Setup environment:**
```bash
cp .env.production .env
# Edit .env sesuai konfigurasi Anda
```

3. **Jalankan dengan Docker Compose:**
```bash
docker-compose up -d
```

4. **Aplikasi akan berjalan di:**
- Backend API: http://localhost:3000
- Database: PostgreSQL di port 5432
- Redis: Redis di port 6379

### Manual Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup database:**
```bash
npm run migrate
npm run seed
```

3. **Jalankan aplikasi:**
```bash
npm run dev
```

## 🔧 Konfigurasi IDCloudHost S3

Sistem menggunakan IDCloudHost S3 untuk penyimpanan file. Berikut cara setupnya:

### 1. Setup di IDCloudHost Panel

1. Login ke [IDCloudHost Console](https://console.idcloudhost.com)
2. Pilih menu **"Object Storage"** atau **"S3 Storage"**
3. Buat bucket baru dengan nama: `isp-inventory-files`
4. Generate **Access Key** & **Secret Key** di menu **API Keys**
5. Catat credentials untuk konfigurasi .env

### 2. Konfigurasi Environment

Tambahkan konfigurasi berikut di file `.env`:

```env
# IDCloudHost S3 Configuration
IDCH_ACCESS_KEY_ID=your_access_key_here
IDCH_SECRET_ACCESS_KEY=your_secret_key_here
IDCH_REGION=regionOne
IDCH_BUCKET_NAME=isp-inventory-files
IDCH_S3_ENDPOINT=https://is3.cloudhost.id
```

### 3. Verifikasi Setup

Saat aplikasi start, akan muncul informasi setup S3:

```
🔧 === IDCLOUDHOST S3 STORAGE SETUP ===
🌐 S3 Endpoint: https://is3.cloudhost.id
📍 Region: regionOne
🪣 Bucket Name: isp-inventory-files
✅ IDCloudHost S3 Configuration: ACTIVE
```

## 👥 User Roles & Access

### Admin
- **Username:** admin
- **Password:** admin123
- **Akses:** Full system access

### Manager  
- **Username:** manager
- **Password:** manager123
- **Akses:** Approve laporan, dashboard overview

### Teknisi
- **Username:** teknisi1
- **Password:** teknisi123
- **Akses:** Buat laporan kegiatan, upload dokumentasi

### Sales
- **Username:** sales1  
- **Password:** sales123
- **Akses:** Laporan penjualan, follow-up customer

## 📱 API Endpoints

### Authentication
```
POST /api/auth/login     - Login
POST /api/auth/register  - Register user baru
GET  /api/auth/me        - Get user profile
```

### Activity Reports
```
GET    /api/activity-reports           - Get semua laporan
POST   /api/activity-reports           - Buat laporan baru
GET    /api/activity-reports/:id       - Get detail laporan
PUT    /api/activity-reports/:id       - Update laporan
DELETE /api/activity-reports/:id       - Hapus laporan
POST   /api/activity-reports/:id/submit - Submit untuk approval
POST   /api/activity-reports/:id/approval - Approve/reject laporan
GET    /api/activity-reports/statistics - Get statistik
```

### File Upload
```
POST   /api/upload/single    - Upload single file
POST   /api/upload/multiple  - Upload multiple files
DELETE /api/upload/:fileKey  - Delete file
GET    /api/upload/url/:fileKey - Get file URL
GET    /api/upload/info      - Get upload info
```

### Inventory
```
GET    /api/inventory        - Get semua item
POST   /api/inventory        - Tambah item baru
PUT    /api/inventory/:id    - Update item
DELETE /api/inventory/:id    - Hapus item
```

## 🔐 Security Features

- **JWT Authentication** dengan expiry
- **Role-based Access Control** (RBAC)
- **Rate Limiting** untuk mencegah abuse
- **File Type Validation** untuk upload
- **Input Sanitization** dan validation
- **CORS Protection**
- **Helmet Security** headers

## 📊 File Upload Specifications

### Supported File Types
- **Images:** JPEG, PNG, GIF, WebP
- **Documents:** PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
- **Text:** Plain text, CSV

### Upload Limits
- **Max File Size:** 10MB per file
- **Max Files:** 5 files per upload
- **Storage:** IDCloudHost S3 (fallback to local storage)

## 🛠️ Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # API controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   └── server.ts       # Main server file
├── database/
│   ├── migrations/     # Database migrations
│   └── seeders/        # Database seeders
└── uploads/           # Local file storage (fallback)
```

### Database Schema
- **users** - User management
- **activity_reports** - Laporan kegiatan
- **inventory_items** - Inventori barang
- **categories** - Kategori barang
- **suppliers** - Data supplier

### Available Scripts
```bash
npm run dev      # Development server
npm run build    # Build production
npm run start    # Start production
npm run migrate  # Run database migrations
npm run seed     # Run database seeders
npm run test     # Run tests
```

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build dan jalankan containers
docker-compose -f docker-compose.yml up -d

# Check status containers
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop containers
docker-compose down
```

### Environment Variables
Pastikan semua environment variables sudah dikonfigurasi dengan benar di file `.env`:

- Database credentials
- JWT secrets
- IDCloudHost S3 credentials
- SMTP settings (untuk email notifications)

## 📋 Troubleshooting

### Common Issues

1. **S3 Upload Error**
   - Pastikan credentials IDCloudHost S3 benar
   - Cek bucket permissions
   - Verifikasi endpoint URL

2. **Database Connection Error**
   - Pastikan PostgreSQL running
   - Cek database credentials
   - Jalankan migrations

3. **File Upload Failed**
   - Cek file size limit
   - Pastikan file type supported
   - Cek storage permissions

### Logs Location
```bash
# Docker logs
docker-compose logs backend

# Local development
Check console output
```

## 🔄 Backup & Restore

### Database Backup
```bash
# Backup
docker exec isp-inventory-db pg_dump -U inventory_user isp_inventory > backup.sql

# Restore
docker exec -i isp-inventory-db psql -U inventory_user isp_inventory < backup.sql
```

### File Backup
File disimpan di IDCloudHost S3, backup otomatis tersedia di dashboard IDCloudHost.

## 📞 Support

Untuk bantuan teknis:
- 📧 Email: support@cloudbit.id
- 📱 WhatsApp: +62-xxx-xxxx-xxxx
- 💬 Telegram: @cloudbit_support

## 📝 License

MIT License - see LICENSE file for details.

---

**CloudBit ISP Inventory System** v1.0.0  
Developed with ❤️ for Indonesian ISP providers
