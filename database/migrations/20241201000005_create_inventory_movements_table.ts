import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('inventory_movements', (table) => {
    table.increments('id').primary();
    table.integer('item_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.enum('movement_type', ['in', 'out', 'adjustment', 'transfer']).notNullable();
    table.integer('quantity').notNullable();
    table.integer('quantity_before').notNullable();
    table.integer('quantity_after').notNullable();
    table.decimal('unit_cost', 15, 2).nullable();
    table.string('reference_number', 50).nullable();
    table.string('location_from', 100).nullable();
    table.string('location_to', 100).nullable();
    table.text('reason').nullable();
    table.text('notes').nullable();
    table.timestamp('movement_date').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('item_id').references('id').inTable('inventory_items').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    
    // Indexes
    table.index(['item_id']);
    table.index(['user_id']);
    table.index(['movement_type']);
    table.index(['movement_date']);
    table.index(['reference_number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('inventory_movements');
}
