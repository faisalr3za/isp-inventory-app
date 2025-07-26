import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Hapus data yang ada
  await knex('users').del();

  // Hash password untuk admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const teknisiPassword = await bcrypt.hash('teknisi123', 12);
  const salesPassword = await bcrypt.hash('sales123', 12);

  // Insert sample users
  await knex('users').insert([
    {
      username: 'admin',
      email: 'admin@cloudbit.net.id',
      password_hash: adminPassword,
      role: 'admin',
      nama_lengkap: 'Administrator CloudBit',
      no_telp: '081234567890',
      alamat: 'Kantor Pusat CloudBit',
      status: 'aktif'
    },
    {
      username: 'teknisi1',
      email: 'teknisi1@cloudbit.net.id',
      password_hash: teknisiPassword,
      role: 'teknisi',
      nama_lengkap: 'Budi Santoso',
      no_telp: '081234567891',
      alamat: 'Jakarta Selatan',
      status: 'aktif'
    },
    {
      username: 'teknisi2',
      email: 'teknisi2@cloudbit.net.id',
      password_hash: teknisiPassword,
      role: 'teknisi',
      nama_lengkap: 'Andi Wijaya',
      no_telp: '081234567892',
      alamat: 'Tangerang',
      status: 'aktif'
    },
    {
      username: 'sales1',
      email: 'sales1@cloudbit.net.id',
      password_hash: salesPassword,
      role: 'sales',
      nama_lengkap: 'Sari Dewi',
      no_telp: '081234567893',
      alamat: 'Bekasi',
      status: 'aktif'
    },
    {
      username: 'manager1',
      email: 'manager@cloudbit.net.id',
      password_hash: adminPassword,
      role: 'manager',
      nama_lengkap: 'Manager CloudBit',
      no_telp: '081234567894',
      alamat: 'Jakarta Pusat',
      status: 'aktif'
    }
  ]);
}
