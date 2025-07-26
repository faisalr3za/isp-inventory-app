import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('inventory_items', (table) => {
    table.increments('id').primary();
    table.string('sku', 50).notNullable().unique();
    table.string('name', 200).notNullable();
    table.text('description').nullable();
    table.integer('category_id').unsigned().notNullable();
    table.integer('supplier_id').unsigned().nullable();
    table.string('brand', 100).nullable();
    table.string('model', 100).nullable();
    table.decimal('purchase_price', 15, 2).defaultTo(0);
    table.decimal('selling_price', 15, 2).defaultTo(0);
    table.integer('quantity_in_stock').defaultTo(0);
    table.integer('minimum_stock').defaultTo(0);
    table.integer('maximum_stock').nullable();
    table.string('unit', 20).defaultTo('pcs');
    table.string('location', 100).nullable();
    table.string('barcode', 100).nullable();
    table.string('serial_number', 100).nullable();
    table.enum('condition', ['new', 'good', 'fair', 'poor', 'damaged']).defaultTo('new');
    table.enum('status', ['active', 'inactive', 'discontinued']).defaultTo('active');
    table.string('image_url', 500).nullable();
    table.json('specifications').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('category_id').references('id').inTable('categories').onDelete('RESTRICT');
    table.foreign('supplier_id').references('id').inTable('suppliers').onDelete('SET NULL');
    
    // Indexes
    table.index(['sku']);
    table.index(['name']);
    table.index(['category_id']);
    table.index(['supplier_id']);
    table.index(['barcode']);
    table.index(['status']);
    table.index(['quantity_in_stock']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('inventory_items');
}
