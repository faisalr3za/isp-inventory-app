import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('activity_reports', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    table.date('tanggal_laporan').notNullable();
    table.enum('jenis_kegiatan', [
      'instalasi',
      'maintenance',
      'troubleshooting',
      'survey',
      'presentasi',
      'follow_up',
      'kunjungan_customer',
      'training',
      'meeting',
      'lainnya'
    ]).notNullable();
    
    table.string('judul_kegiatan', 255).notNullable();
    table.text('deskripsi_kegiatan').notNullable();
    table.string('lokasi', 255);
    table.string('customer_name', 255);
    table.string('customer_contact', 100);
    
    // Waktu kegiatan
    table.time('waktu_mulai');
    table.time('waktu_selesai');
    table.integer('durasi_menit'); // durasi dalam menit
    
    // Status dan hasil
    table.enum('status', ['pending', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
    table.enum('hasil', ['berhasil', 'gagal', 'partial', 'pending']).defaultTo('pending');
    table.text('catatan_hasil');
    
    // Untuk teknisi
    table.string('peralatan_digunakan', 500); // JSON string untuk list peralatan
    table.string('material_digunakan', 500); // JSON string untuk list material
    table.decimal('biaya_material', 12, 2).defaultTo(0);
    table.decimal('biaya_transport', 12, 2).defaultTo(0);
    
    // Untuk sales
    table.decimal('target_penjualan', 12, 2).defaultTo(0);
    table.decimal('realisasi_penjualan', 12, 2).defaultTo(0);
    table.integer('prospek_baru').defaultTo(0);
    table.integer('follow_up_count').defaultTo(0);
    
    // File attachment
    table.string('foto_dokumentasi', 500); // JSON string untuk multiple photos
    table.string('dokumen_pendukung', 500); // JSON string untuk files
    
    // Priority dan urgency
    table.enum('prioritas', ['rendah', 'sedang', 'tinggi', 'urgent']).defaultTo('sedang');
    table.text('kendala_hambatan');
    table.text('rencana_tindak_lanjut');
    
    // Approval workflow
    table.enum('status_approval', ['draft', 'submitted', 'approved', 'rejected']).defaultTo('draft');
    table.integer('approved_by').unsigned();
    table.foreign('approved_by').references('id').inTable('users');
    table.timestamp('approved_at');
    table.text('catatan_approval');
    
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id', 'tanggal_laporan']);
    table.index(['jenis_kegiatan']);
    table.index(['status']);
    table.index(['status_approval']);
    table.index(['tanggal_laporan']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('activity_reports');
}
