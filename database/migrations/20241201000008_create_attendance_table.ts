import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('attendance', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.timestamp('check_in_time').nullable();
    table.timestamp('check_out_time').nullable();
    table.string('check_in_location').nullable();
    table.string('check_out_location').nullable();
    table.decimal('check_in_latitude', 10, 8).nullable();
    table.decimal('check_in_longitude', 11, 8).nullable();
    table.decimal('check_out_latitude', 10, 8).nullable();
    table.decimal('check_out_longitude', 11, 8).nullable();
    table.text('check_in_notes').nullable();
    table.text('check_out_notes').nullable();
    table.enum('status', ['present', 'late', 'absent', 'half_day']).defaultTo('present');
    table.integer('work_hours').nullable(); // in minutes
    table.date('attendance_date').notNullable();
    table.timestamps(true, true);

    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index(['user_id', 'attendance_date']);
    table.index('attendance_date');
    table.index('status');
    
    // Unique constraint to prevent duplicate attendance per day
    table.unique(['user_id', 'attendance_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('attendance');
}
