import { BaseModel } from "./base.model";
import { RestaurantModel } from "./restaurant.model";
import { JSONSchema, ModelObject } from "objection";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export class BusinessHourModel extends BaseModel {
  id!: number;
  restaurantId!: string;
  dayOfWeek!: DayOfWeek;
  openTime!: string;
  closeTime!: string;
  isOpen!: boolean;
  restaurant?: RestaurantModel;

  static get tableName() {
    return "restaurant_business_hours";
  }



  // Validation schema
  static get jsonSchema(): JSONSchema {
    return {
      type: "object",
      required: ["restaurantId", "dayOfWeek", "openTime", "closeTime"],
      properties: {
        id: { type: "integer" },
        restaurant_id: { type: "string", format: "uuid" },
        day_of_week: {
          type: "string",
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        open_time: {
          type: "string",
          pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
        },
        close_time: {
          type: "string",
          pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
        },
        isOpen: { type: "boolean", default: true },
      },
    };
  }

  // Define relationships
  static get relationMappings() {
    return {
      restaurant: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: RestaurantModel,
        join: {
          from: "restaurant_business_hours.restaurantId",
          to: "restaurants.id",
        },
      },
    };
  }
}

export type BusinessHourModelType = ModelObject<BusinessHourModel>;
