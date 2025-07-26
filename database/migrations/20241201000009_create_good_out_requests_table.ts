import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('good_out_requests', (table) => {
    table.increments('id').primary();
    table.integer('item_id').unsigned().notNullable();
    table.integer('requested_by').unsigned().notNullable();
    table.integer('approved_by').unsigned().nullable();
    table.integer('quantity').notNullable();
    table.string('reason', 500).notNullable();
    table.text('notes').nullable();
    table.json('customer_info').nullable(); // {name, phone, address, order_id}
    table.enu('status', ['pending', 'approved', 'rejected', 'completed']).defaultTo('pending');
    table.string('rejection_reason', 500).nullable();
    table.timestamp('requested_at').defaultTo(knex.fn.now());
    table.timestamp('approved_at').nullable();
    table.timestamp('completed_at').nullable();
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('item_id').references('id').inTable('inventory_items').onDelete('cascade');
    table.foreign('requested_by').references('id').inTable('users').onDelete('cascade');
    table.foreign('approved_by').references('id').inTable('users').onDelete('set null');
    
    // Indexes
    table.index(['status']);
    table.index(['requested_by']);
    table.index(['approved_by']);
    table.index(['item_id']);
    table.index(['requested_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('good_out_requests');
}
