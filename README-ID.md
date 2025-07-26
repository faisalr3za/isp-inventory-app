# Sistem Manajemen Inventori ISP CloudBit

**Internet Cepat & Stabil #pilihCloudBit**

Sistem manajemen inventori yang komprehensif dengan kemampuan pemindaian barcode/QR code, dibangun khusus untuk CloudBit dan Penyedia Jasa Internet (ISP) yang membutuhkan pelacakan inventori yang efisien.

*Didukung oleh [CloudBit.net.id](https://cloudbit.net.id) - Internet Cepat & Stabil untuk semua kebutuhan*

## 🚀 Fitur Utama

### ✅ Fitur Inti
- **Aplikasi Web Modern** - Dibangun dengan React, TypeScript, Node.js
- **Progressive Web App (PWA)** - Dapat diinstal di perangkat mobile untuk akses offline
- **Desain Responsif** - Bekerja seamless di desktop dan perangkat mobile
- **Autentikasi & Otorisasi** - Kontrol akses berbasis peran (Admin, Manager, Teknisi, Sales)
- **Update Real-time** - Socket.IO untuk update inventori langsung

*Sistem ini dirancang khusus untuk mendukung operasional CloudBit dalam memberikan layanan internet cepat dan stabil kepada pelanggan.*

### 📦 Manajemen Inventori
- **Operasi CRUD Lengkap** - Manajemen item inventori komprehensif
- **Manajemen Kategori** - Organisir item berdasarkan kategori
- **Manajemen Supplier** - Lacak informasi supplier dan vendor
- **Pelacakan Pergerakan Stok** - Monitor perpindahan masuk/keluar/penyesuaian
- **Peringatan Stok Rendah** - Notifikasi otomatis untuk item di bawah batas minimum
- **Sistem Permintaan Good Out** - Alur persetujuan untuk pengambilan barang dari inventori
- **Akses Inventori Berbasis Peran** - Level akses berbeda untuk peran pengguna berbeda

### 🕒 Manajemen Kehadiran
- **Check-in & Check-out** - Lacak kehadiran karyawan dengan data real-time
- **Pelacakan Lokasi** - Lokasi berbasis GPS untuk check-in/out
- **Riwayat & Statistik Kehadiran** - Lihat catatan masa lalu dan statistik detail
- **Update Real-time** - Refresh otomatis setiap 30 detik
- **Deteksi Status** - Bedakan antara hadir, terlambat, tidak hadir, dan setengah hari

### 🔄 Sistem Permintaan Good Out
- **Permintaan Teknisi** - Teknisi lapangan dapat meminta barang untuk instalasi pelanggan
- **Integrasi Barcode** - Scan item untuk cepat membuat permintaan
- **Alur Persetujuan** - Persetujuan Manager/Admin sebelum barang dikeluarkan dari inventori
- **Notifikasi Real-time** - Notifikasi instan untuk permintaan yang menunggu
- **Pelacakan Permintaan** - Jejak audit lengkap dari permintaan hingga selesai
- **Validasi Stok** - Pengecekan ketersediaan stok otomatis
- **Interface Mobile-optimized** - Sempurna untuk operasi lapangan

### 📱 Fitur Barcode & QR Code
- **Pemindaian Kamera** - Pindai barcode/QR code menggunakan kamera perangkat
- **Generasi Kode** - Auto-generate barcode dan QR code untuk item
- **Stiker Cetak** - Generate stiker PDF untuk pelabelan fisik
- **Operasi Massal** - Generate kode untuk multiple item sekaligus
- **Format Beragam** - Dukungan untuk CODE128, EAN13, EAN8, QR codes
- **Sistem Permintaan Terintegrasi** - Scan item untuk membuat permintaan good out
- **Pemindaian Mobile-first** - Dioptimalkan untuk teknisi lapangan

### 📊 Laporan & Analitik
- **Laporan Stock Opname** - Overview status inventori lengkap
- **Laporan Varians Stok** - Lacak perbedaan dan penyesuaian
- **Laporan Pergerakan Bulanan** - Analisis pergerakan inventori dari waktu ke waktu
- **Dashboard Analitik** - Metrik kunci dan insight
- **Laporan Stock Aging** - Identifikasi inventori yang bergerak lambat
- **Export CSV** - Export semua laporan ke format CSV

### 🔧 Fitur Teknis
- **RESTful API** - Endpoint REST yang terdokumentasi dengan baik
- **Database Migrations** - Versioning database terstruktur
- **Dukungan Upload File** - Gambar item dan lampiran dokumen
- **Rate Limiting** - Proteksi API dan pencegahan penyalahgunaan
- **Error Handling** - Manajemen error komprehensif
- **Monitoring Kesehatan** - Endpoint health check aplikasi
- **Dukungan Docker** - Deploy mudah dengan Docker Compose

## 🏗️ Arsitektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React PWA)   │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   File Storage  │    │   Redis Cache   │
│   (Reverse      │    │   (uploads/)    │    │   (Opsional)    │
│   Proxy)        │    │                 │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React 18** - React modern dengan hooks
- **TypeScript** - Pengembangan type-safe
- **Tailwind CSS** - Framework CSS utility-first
- **Vite** - Build tool dan development server cepat
- **React Query** - Manajemen state server
- **React Hook Form** - Handling form
- **Lucide React** - Library ikon modern
- **Dukungan PWA** - Service workers dan manifest

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Framework aplikasi web
- **TypeScript** - Pengembangan server type-safe
- **PostgreSQL** - Database relasional
- **Knex.js** - SQL query builder dan migrations
- **JWT** - Autentikasi JSON Web Token
- **Socket.IO** - Komunikasi real-time
- **Multer** - Handling upload file
- **Sharp** - Pemrosesan gambar
- **Canvas & JsBarcode** - Generasi barcode
- **QRCode** - Generasi QR code
- **PDFKit** - Generasi PDF

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Orkestrasi multi-container
- **Nginx** - Reverse proxy dan serving file statis
- **PM2** - Manajemen proses (opsional)

## 📋 Persyaratan Sistem

- **Node.js** 18+ 
- **Docker & Docker Compose** (direkomendasikan)
- **PostgreSQL** 15+ (jika tidak menggunakan Docker)
- **Git**

## 🚀 Panduan Cepat

### 1. Clone Repository
```bash
git clone https://github.com/your-username/isp-inventory-app.git
cd isp-inventory-app
```

### 2. Setup Environment
```bash
# Copy template environment
cp .env.example .env

# Edit dengan konfigurasi Anda
nano .env
```

Variabel environment yang diperlukan:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_management
DB_USER=postgres
DB_PASSWORD=password_aman_anda

# JWT Secret (minimum 32 karakter)
JWT_SECRET=jwt_secret_key_super_aman_minimum_32_karakter

# Aplikasi
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Deployment Docker (Direkomendasikan)
```bash
# Jalankan semua service
docker-compose up -d

# Cek status
docker-compose ps

# Lihat logs
docker-compose logs -f backend
```

### 4. Setup Manual (Alternatif)
```bash
# Setup backend
cd backend
npm install
npm run migrate
npm start

# Setup frontend (terminal baru)
cd frontend
npm install
npm run build
npm run preview
```

## 📱 Cara Penggunaan

### Aplikasi Web
- **Dashboard Desktop**: http://localhost:3000/dashboard
- **PWA Mobile**: http://localhost:3000 (install sebagai PWA)
- **Halaman Kehadiran**: http://localhost:3000/attendance
- **Permintaan Good Out**: http://localhost:3000/good-out-request (Teknisi)
- **Dashboard Persetujuan**: http://localhost:3000/good-out-approval (Manager/Admin)

### Endpoint API
- **Health Check**: http://localhost:5000/health
- **API Kehadiran**: http://localhost:5000/api/attendance
- **Permintaan Good Out**: http://localhost:5000/api/good-out-requests
- **Scanner Barcode**: http://localhost:5000/api/barcode
- **Dokumentasi API**: Lihat `API_DOCUMENTATION.md`

### Contoh API Kehadiran
```bash
# Dapatkan kehadiran hari ini
curl -X GET http://localhost:5000/api/attendance/today \
  -H "Authorization: Bearer TOKEN_JWT_ANDA"

# Check-in dengan lokasi
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_JWT_ANDA" \
  -d '{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "location": "Kantor Jakarta",
    "notes": "Mulai bekerja hari ini"
  }'

# Check-out
curl -X POST http://localhost:5000/api/attendance/check-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_JWT_ANDA" \
  -d '{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "location": "Kantor Jakarta",
    "notes": "Selesai bekerja"
  }'

# Dapatkan statistik kehadiran
curl -X GET http://localhost:5000/api/attendance/stats \
  -H "Authorization: Bearer TOKEN_JWT_ANDA"
```

### Contoh API Permintaan Good Out
```bash
# Buat permintaan good out (Teknisi)
curl -X POST http://localhost:5000/api/good-out-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_JWT_ANDA" \
  -d '{
    "item_id": 1,
    "quantity": 2,
    "usage_description": "Pemasangan internet pelanggan baru",
    "customer_location": "Jl. Sudirman No. 123, Jakarta"
  }'

# Dapatkan permintaan pending (Manager/Admin)
curl -X GET http://localhost:5000/api/good-out-requests?status=pending \
  -H "Authorization: Bearer TOKEN_JWT_ANDA"

# Setujui permintaan (Manager/Admin)
curl -X PUT http://localhost:5000/api/good-out-requests/1/approve \
  -H "Authorization: Bearer TOKEN_JWT_ANDA"

# Tolak permintaan (Manager/Admin)
curl -X PUT http://localhost:5000/api/good-out-requests/1/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_JWT_ANDA" \
  -d '{
    "rejection_reason": "Stok tidak mencukupi untuk permintaan ini"
  }'

# Dapatkan jumlah permintaan pending untuk notifikasi
curl -X GET http://localhost:5000/api/good-out-requests/pending/count \
  -H "Authorization: Bearer TOKEN_JWT_ANDA"
```

### Kredensial Default
```
Admin: admin@company.com / admin123
Manager: manager@company.com / manager123  
Teknisi: teknisi@company.com / teknisi123
Sales: sales@company.com / sales123
```

## 📖 Dokumentasi

- **[Dokumentasi API](API_DOCUMENTATION.md)** - Referensi API lengkap
- **[Panduan Deployment](DEPLOYMENT_GUIDE.md)** - Instruksi deployment produksi
- **[API Barcode](BARCODE_API.md)** - Fungsionalitas barcode/QR code
- **[Laporan Aktivitas](ACTIVITY_REPORTS_API.md)** - Detail sistem pelaporan

## 🔧 Development

### Development Lokal
```bash
# Development backend
cd backend
npm run dev

# Development frontend
cd frontend  
npm run dev
```

### Operasi Database
```bash
# Jalankan migrations
npm run migrate

# Rollback migration
npm run rollback

# Buat migration baru
npm run make:migration nama_migration

# Seed database
npm run seed
```

### Build untuk Produksi
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 📊 Overview Fitur

### Fitur PWA Mobile
- 📱 **Instalasi Home Screen** - Tambahkan ke home screen perangkat
- 🔍 **Scanner Barcode** - Pemindaian berbasis kamera
- 📦 **Inventori Cepat** - Lihat dan cari item
- 🕒 **Kehadiran (Presensi)** - Check-in/out dengan lokasi GPS
- 📋 **Permintaan Good Out** - Buat dan lacak permintaan inventori (Teknisi)
- 👤 **Profil Pengguna** - Manajemen akun
- 🔄 **Dukungan Offline** - Fungsionalitas dasar tanpa internet

### Fitur Dashboard Desktop
- 📊 **Dashboard Analitik** - Metrik kunci dan grafik
- 📦 **Manajemen Inventori** - Operasi CRUD penuh
- 📈 **Pergerakan Stok** - Riwayat dan pelacakan pergerakan
- 🏷️ **Kategori & Supplier** - Manajemen data master
- 📋 **Laporan Komprehensif** - Berbagai jenis laporan
- 🔍 **Pencarian Lanjutan** - Kemampuan filter dan pencarian
- 👥 **Manajemen Pengguna** - Kontrol akses berbasis peran
- 🔔 **Dashboard Persetujuan** - Kelola permintaan good out dengan notifikasi real-time
- 📱 **Desain Mobile-first** - Interface responsif untuk semua perangkat

### 🕒 Fitur Manajemen Kehadiran
- ⏰ **Check-in/out Real-time** - Lacak kehadiran karyawan dengan lokasi GPS
- 📍 **Layanan Lokasi** - Deteksi lokasi otomatis dan reverse geocoding
- 📅 **Riwayat Kehadiran** - Catatan lengkap dengan filtering dan pagination
- 📊 **Dashboard Statistik** - Analitik kehadiran bulanan dan insight
- 🚨 **Deteksi Terlambat** - Penandaan status otomatis (hadir/terlambat setelah jam 9)
- ⏱️ **Kalkulasi Jam Kerja** - Perhitungan otomatis jam kerja harian
- 📱 **Mobile Optimized** - Sempurna untuk workforce mobile dengan dukungan PWA
- 🔄 **Update Real-time** - Update status langsung setiap 30 detik

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/fitur-keren`)
3. Commit perubahan Anda (`git commit -m 'Tambah fitur keren'`)
4. Push ke branch (`git push origin feature/fitur-keren`)
5. Buat Pull Request

## 📝 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detail.

## 🆘 Dukungan

### Masalah Umum
- **Koneksi Database**: Periksa service PostgreSQL dan kredensial
- **Izin File**: Pastikan direktori uploads dapat ditulis
- **Konflik Port**: Periksa apakah port 3000, 5000, 5432 tersedia
- **Instalasi PWA**: Gunakan HTTPS di produksi untuk fitur PWA

### Mendapatkan Bantuan
1. Periksa [Issues](https://github.com/your-username/isp-inventory-app/issues) yang sudah ada
2. Review file dokumentasi
3. Buat issue baru dengan informasi detail

## 🎯 Roadmap

- [x] **Sistem Permintaan Good Out** - Alur persetujuan untuk pengambilan inventori
- [x] **Notifikasi Real-time** - Update langsung untuk manager dan teknisi
- [x] **Desain Mobile-first** - Interface optimal untuk teknisi lapangan
- [ ] **Aplikasi Mobile** - Versi React Native
- [ ] **Analitik Lanjutan** - Pelaporan lebih detail
- [ ] **Dukungan Multi-lokasi** - Multiple lokasi gudang
- [ ] **Integrasi** - Integrasi sistem pihak ketiga
- [ ] **Automated Reordering** - Replenishment stok pintar
- [ ] **Enhanced Audit Trail** - Pelacakan perubahan dengan log detail
- [ ] **Integrasi WhatsApp** - Notifikasi via WhatsApp API
- [ ] **Tanda Tangan Digital** - Tanda tangan persetujuan elektronik

## 👥 Tim

- **Pengembangan Backend** - Node.js, PostgreSQL, desain API
- **Pengembangan Frontend** - React, TypeScript, implementasi PWA  
- **DevOps** - Docker, deployment, CI/CD
- **QA & Testing** - Strategi testing dan quality assurance

---

**Dibuat dengan ❤️ untuk CloudBit - Internet Cepat & Stabil #pilihCloudBit**

---

### Tentang CloudBit

CloudBit adalah penyedia layanan internet yang mengutamakan kecepatan dan stabilitas koneksi. Kami berkomitmen memberikan:

- **Internet Cepat & Stabil** - Koneksi fiber optic 100%
- **Unlimited Tanpa FUP** - Akses internet sepuasnya
- **24/7 Technical Support** - Dukungan teknis sepanjang waktu
- **Coverage Luas** - Melayani berbagai lokasi strategis

**Hubungi Kami:**
- Website: [https://cloudbit.net.id](https://cloudbit.net.id)
- WhatsApp: +62 856-2467-9994
- Slogan: "Internet Cepat & Stabil #pilihCloudBit"

**Mengapa Memilih Sistem Inventori CloudBit?**

✅ **Dirancang untuk ISP Lokal** - Memahami kebutuhan spesifik ISP Indonesia
✅ **Teknisi Lapangan First** - Interface mobile-optimized untuk teknisi di lapangan
✅ **Approval Workflow** - Kontrol yang ketat namun efisien untuk pengeluaran barang
✅ **Real-time Monitoring** - Pantau inventori dan aktivitas secara real-time
✅ **Dokumentasi Bahasa Indonesia** - Setup dan dokumentasi dalam bahasa Indonesia
✅ **Support Lokal** - Tim support yang memahami konteks bisnis Indonesia

**Perfect untuk:**
- 🏢 **ISP Kecil-Menengah** - Mulai dari 10-500 pelanggan
- 🌐 **Provider Internet Daerah** - ISP yang melayani wilayah spesifik
- 📡 **Wireless Internet Service Provider (WISP)** - Penyedia internet wireless
- 🏘️ **RT/RW Net** - Pengelola internet komunitas
- 🏪 **Toko Komputer & IT** - Retailer perangkat networking

Untuk instruksi setup detail, lihat [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
