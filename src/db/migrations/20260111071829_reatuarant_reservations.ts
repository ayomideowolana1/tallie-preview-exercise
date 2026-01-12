import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable("restaurant_reservations", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("restaurantId")
      .notNullable()
      .references("id")
      .inTable("restaurants")
      .onDelete("CASCADE");
    table
      .uuid("tableId")
      .notNullable()
      .references("id")
      .inTable("restaurant_tables")
      .onDelete("CASCADE");
    table.date("date").notNullable();
    table.time("startTime").notNullable();
    table.integer("duration").notNullable().comment("duration in minutes");
    table.time("endTime").notNullable();
    table.string("customerName").notNullable();
    table.string("phone").notNullable();
    table.integer("partySize").notNullable();
    table.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {}
