import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("restaurant_business_hours", (table) => {
    table.increments("id").primary();
    table
      .uuid("restaurantId")
      .notNullable()
      .references("id")
      .inTable("restaurants")
      .onDelete("CASCADE");
    table
      .enum("dayOfWeek", [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
      .notNullable();
      table.boolean("isOpen").notNullable().defaultTo(false);
    table.time("openTime").notNullable().defaultTo('00:00');
    table.time("closeTime").notNullable().defaultTo('00:00');
    table.timestamps(true, true, true);
    table.unique(["restaurantId", "dayOfWeek"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTableIfExists("restaurant_business_hours");
}
