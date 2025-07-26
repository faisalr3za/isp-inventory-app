import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Get user IDs untuk teknisi dan sales
  const users = await knex('users').select('id', 'role').where('role', 'in', ['teknisi', 'sales']);
  
  if (users.length === 0) {
    console.log('No teknisi or sales users found, skipping activity reports seed');
    return;
  }

  // Deletes ALL existing entries
  await knex('activity_reports').del();

  // Sample activity reports
  const activityReports = [
    // Laporan Teknisi 1
    {
      user_id: users.find(u => u.role === 'teknisi')?.id || users[0].id,
      tanggal_laporan: '2024-12-01',
      jenis_kegiatan: 'instalasi',
      judul_kegiatan: 'Instalasi Internet Fiber untuk PT ABC',
      deskripsi_kegiatan: 'Melakukan instalasi internet fiber 100 Mbps untuk kantor PT ABC. Proses instalasi dimulai dengan survey lokasi, pemasangan kabel fiber optik dari tiang utama ke gedung, konfigurasi ONT, dan testing koneksi.',
      lokasi: 'Jl. Sudirman No. 123, Jakarta Pusat',
      customer_name: 'PT ABC Technology',
      customer_contact: '021-1234567',
      waktu_mulai: '09:00',
      waktu_selesai: '15:00',
      durasi_menit: 360,
      status: 'completed',
      hasil: 'berhasil',
      catatan_hasil: 'Instalasi berhasil, speed test mencapai 98 Mbps download dan 95 Mbps upload. Customer puas dengan layanan.',
      peralatan_digunakan: JSON.stringify(['Fusion Splicer', 'OTDR', 'Power Meter', 'ONU Huawei', 'Kabel Fiber 50m']),
      material_digunakan: JSON.stringify(['Connector SC/APC', 'Splice Protection Sleeve', 'Cable Tie', 'Duct Tape']),
      biaya_material: 150000,
      biaya_transport: 50000,
      foto_dokumentasi: JSON.stringify(['install_before.jpg', 'install_process.jpg', 'install_after.jpg', 'speedtest.jpg']),
      prioritas: 'tinggi',
      kendala_hambatan: 'Sedikit kendala pada akses ke ruang server, namun dapat diatasi dengan koordinasi dengan security.',
      rencana_tindak_lanjut: 'Follow up dalam 1 minggu untuk memastikan stabilitas koneksi',
      status_approval: 'approved'
    },
    
    // Laporan Sales 1
    {
      user_id: users.find(u => u.role === 'sales')?.id || users[0].id,
      tanggal_laporan: '2024-12-01',
      jenis_kegiatan: 'presentasi',
      judul_kegiatan: 'Presentasi Layanan Internet untuk Hotel XYZ',
      deskripsi_kegiatan: 'Melakukan presentasi produk layanan internet dedicated dan managed services untuk Hotel XYZ. Menjelaskan paket-paket yang tersedia, benefit managed services, dan case study implementasi di hotel lain.',
      lokasi: 'Hotel XYZ, Jl. Thamrin No. 45, Jakarta',
      customer_name: 'Hotel XYZ Management',
      customer_contact: '021-9876543',
      waktu_mulai: '14:00',
      waktu_selesai: '16:30',
      durasi_menit: 150,
      status: 'completed',
      hasil: 'berhasil',
      catatan_hasil: 'Presentasi berjalan lancar, pihak hotel tertarik dengan paket internet 500 Mbps + managed WiFi. Akan ada meeting lanjutan minggu depan.',
      target_penjualan: 50000000,
      realisasi_penjualan: 0,
      prospek_baru: 1,
      follow_up_count: 1,
      foto_dokumentasi: JSON.stringify(['presentation_setup.jpg', 'meeting_room.jpg', 'team_photo.jpg']),
      dokumen_pendukung: JSON.stringify(['proposal_hotel_xyz.pdf', 'price_list.pdf', 'company_profile.pdf']),
      prioritas: 'tinggi',
      kendala_hambatan: 'Tidak ada kendala berarti',
      rencana_tindak_lanjut: 'Follow up meeting pada tanggal 8 Desember 2024 untuk finalisasi kontrak',
      status_approval: 'approved'
    },

    // Laporan Teknisi 2 (Draft)
    {
      user_id: users.find(u => u.role === 'teknisi')?.id || users[0].id,
      tanggal_laporan: '2024-12-02',
      jenis_kegiatan: 'maintenance',
      judul_kegiatan: 'Maintenance Rutin Server Client DEF Corp',
      deskripsi_kegiatan: 'Melakukan maintenance rutin bulanan untuk server dan jaringan PT DEF Corp. Termasuk backup data, update system, cleaning hardware, dan monitoring performance.',
      lokasi: 'PT DEF Corp, Jl. Gatot Subroto No. 88, Jakarta',
      customer_name: 'PT DEF Corp',
      customer_contact: '021-5555666',
      waktu_mulai: '08:00',
      waktu_selesai: '12:00',
      durasi_menit: 240,
      status: 'in_progress',
      hasil: 'pending',
      catatan_hasil: 'Maintenance masih dalam proses, sudah selesai backup dan update. Tinggal cleaning hardware dan final testing.',
      peralatan_digunakan: JSON.stringify(['Laptop Service', 'Blower', 'Thermal Paste', 'Multimeter']),
      material_digunakan: JSON.stringify(['Thermal Compound', 'Compressed Air', 'Cleaning Cloth']),
      biaya_material: 75000,
      biaya_transport: 25000,
      prioritas: 'sedang',
      kendala_hambatan: 'Salah satu server memerlukan penggantian thermal paste karena overheating',
      rencana_tindak_lanjut: 'Selesaikan maintenance dan buat laporan performa sistem',
      status_approval: 'draft'
    },

    // Laporan Sales 2 (Submitted)
    {
      user_id: users.find(u => u.role === 'sales')?.id || users[0].id,
      tanggal_laporan: '2024-12-02',
      jenis_kegiatan: 'kunjungan_customer',
      judul_kegiatan: 'Kunjungan Follow Up Customer GHI Industries',
      deskripsi_kegiatan: 'Kunjungan follow up untuk membahas feedback penggunaan layanan internet dedicated 200 Mbps yang sudah berjalan 3 bulan. Evaluasi kepuasan customer dan explore kemungkinan upgrade layanan.',
      lokasi: 'GHI Industries, Kawasan Industri Pulogadung, Jakarta',
      customer_name: 'GHI Industries',
      customer_contact: '021-4444555',
      waktu_mulai: '10:00',
      waktu_selesai: '11:30',
      durasi_menit: 90,
      status: 'completed',
      hasil: 'berhasil',
      catatan_hasil: 'Customer puas dengan layanan existing. Tertarik untuk upgrade ke paket 500 Mbps dan menambah layanan managed security.',
      target_penjualan: 25000000,
      realisasi_penjualan: 0,
      prospek_baru: 0,
      follow_up_count: 1,
      foto_dokumentasi: JSON.stringify(['customer_office.jpg', 'meeting_discussion.jpg']),
      prioritas: 'sedang',
      kendala_hambatan: 'Customer meminta waktu 2 minggu untuk internal approval budget upgrade',
      rencana_tindak_lanjut: 'Follow up dalam 2 minggu untuk konfirmasi upgrade dan prepare proposal detail',
      status_approval: 'submitted'
    },

    // Laporan Teknisi 3 (Troubleshooting)
    {
      user_id: users.find(u => u.role === 'teknisi')?.id || users[0].id,
      tanggal_laporan: '2024-12-03',
      jenis_kegiatan: 'troubleshooting',
      judul_kegiatan: 'Troubleshooting Koneksi Intermittent PT JKL Solusi',
      deskripsi_kegiatan: 'Mengatasi masalah koneksi internet yang sering putus-sambung di PT JKL Solusi. Melakukan diagnosa dari ONT, router, hingga konfigurasi network. Ditemukan masalah pada kabel patch cord yang sudah rusak.',
      lokasi: 'PT JKL Solusi, Jl. HR Rasuna Said No. 12, Jakarta',
      customer_name: 'PT JKL Solusi',
      customer_contact: '021-7777888',
      waktu_mulai: '13:00',
      waktu_selesai: '17:00',
      durasi_menit: 240,
      status: 'completed',
      hasil: 'berhasil',
      catatan_hasil: 'Masalah berhasil diatasi dengan mengganti kabel patch cord yang rusak dan rekonfigurasi router. Koneksi sudah stabil kembali.',
      peralatan_digunakan: JSON.stringify(['Cable Tester', 'Crimping Tool', 'Multimeter', 'Laptop Diagnostic']),
      material_digunakan: JSON.stringify(['Patch Cord Cat6 2m', 'RJ45 Connector']),
      biaya_material: 45000,
      biaya_transport: 30000,
      foto_dokumentasi: JSON.stringify(['damaged_cable.jpg', 'replacement_process.jpg', 'final_test.jpg']),
      prioritas: 'urgent',
      kendala_hambatan: 'Sempat sulit mengidentifikasi akar masalah karena intermittent issue',
      rencana_tindak_lanjut: 'Monitor stabilitas koneksi selama 48 jam ke depan',
      status_approval: 'submitted'
    }
  ];

  // Insert seed entries
  await knex('activity_reports').insert(activityReports);
  
  console.log('✅ Activity reports seeder completed');
}
