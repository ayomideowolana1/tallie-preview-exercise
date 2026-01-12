import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable("restaurant_tables", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table
      .uuid("restaurantId")
      .notNullable()
      .references("id")
      .inTable("restaurants")
      .onDelete("CASCADE");
    table.integer("tableNumber").notNullable();
    table.integer("capacity").notNullable();
    table.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
    return await knex.schema.dropTableIfExists("restaurant_tables");
}
