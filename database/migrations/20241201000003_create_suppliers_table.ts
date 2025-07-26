import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('suppliers', (table) => {
    table.increments('id').primary();
    table.string('name', 200).notNullable();
    table.string('code', 20).notNullable().unique();
    table.string('contact_person', 100).nullable();
    table.string('phone', 20).nullable();
    table.string('email', 100).nullable();
    table.text('address').nullable();
    table.string('city', 50).nullable();
    table.string('postal_code', 10).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['name']);
    table.index(['code']);
    table.index(['email']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('suppliers');
}
