import { BaseModel } from "./base.model";
import { BusinessHourModel } from "./business-hour.model";
import { JSONSchema, ModelObject } from "objection";
import { v4 as uuidv4 } from "uuid";
import { TableModel } from "./table.model";
import { RestaurantModel } from "./restaurant.model";

export class ReservationModel extends BaseModel {
  id!: string;
  restaurantId!: string;
  tableId!: string;
  date!: string;
  startTime!: string;
  duration!: string;
  endTime!: string;
  customerName!: string;
  phone!: string;
  partySize!: string;
  table?: TableModel;
  restaurant?: RestaurantModel;

  static get tableName() {
    return "restaurant_reservations";
  }

  static get jsonSchema(): JSONSchema {
    return {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        restaurantId: { type: "string", format: "uuid" },
        tableId: { type: "string", format: "uuid" },
        date: { type: "string", format: "date" },
        startTime: {
          type: "string",
          pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
        },
        duration: { type: "integer", minimum: 1 },
        endTime: { type: "string", pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" },
        customerName: { type: "string", minLength: 1, maxLength: 255 },
        phone: { type: "string", minLength: 1, maxLength: 255 },
        partySize: { type: "integer", minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    return {
      businessHours: {
        relation: BaseModel.HasManyRelation,
        modelClass: BusinessHourModel,
        join: {
          from: "restaurants.id",
          to: "restaurant_business_hours.restaurantId",
        },
      },
      table: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: TableModel,
        join: {
          from: "restaurants.id",
          to: "restaurant_tables.restaurantId",
        },
      },
    };
  }

  async $beforeInsert(queryContext: any) {
    await super.$beforeInsert(queryContext);

    if (!this.id) {
      this.id = uuidv4();
    }
  }
}

export type ReservationModelType = ModelObject<ReservationModel>;
