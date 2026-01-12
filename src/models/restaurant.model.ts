import { BaseModel } from "./base.model";
import { BusinessHourModel } from "./business-hour.model";
import { JSONSchema,Model,ModelObject } from "objection";
import { v4 as uuidv4 } from "uuid";
import { TableModel } from "./table.model";

export class RestaurantModel extends BaseModel {
  id!: string;
  name!: string;
  businessHours?: BusinessHourModel[];
  tables?: TableModel[];

  static get tableName() {
    return "restaurants";
  }

  

  
  static get jsonSchema(): JSONSchema {
    return {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string", minLength: 1, maxLength: 255 },
      },
    };
  }

  
  static get relationMappings() {
    return {
      businessHours: {
        relation: Model.HasManyRelation,
        modelClass: BusinessHourModel,
        join: {
          from: "restaurants.id",
          to: "restaurant_business_hours.restaurantId",
        },
      },
      tables: {
        relation: Model.HasManyRelation,
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

export type RestaurantModelType = ModelObject<RestaurantModel>;
