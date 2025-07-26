import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('inventory_items', (table) => {
    table.string('qr_code', 100).nullable();
    table.string('qr_code_path', 500).nullable();
    table.string('barcode_path', 500).nullable();
    
    // Add indexes for better performance
    table.index(['qr_code']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('inventory_items', (table) => {
    table.dropColumn('qr_code');
    table.dropColumn('qr_code_path');
    table.dropColumn('barcode_path');
  });
}
