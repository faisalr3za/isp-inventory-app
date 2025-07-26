import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('email', 100).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enu('role', ['admin', 'teknisi', 'sales', 'manager']).notNullable();
    table.string('nama_lengkap', 100).notNullable();
    table.string('no_telp', 15).nullable();
    table.text('alamat').nullable();
    table.enu('status', ['aktif', 'nonaktif']).defaultTo('aktif');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['username']);
    table.index(['role']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
