import { BaseModel } from "./base.model";
import { BusinessHourModel } from "./business-hour.model";
import { JSONSchema,ModelObject } from "objection";
import { v4 as uuidv4 } from "uuid";
import { RestaurantModel } from "./restaurant.model";

export class TableModel extends BaseModel {
  id!: string;
  restaurantId!: string;
  tableNumber!: number;
  capacity!: number;
  restaurant?: RestaurantModel

  static get tableName() {
    return "restaurant_tables";
  }

  
  static get jsonSchema(): JSONSchema {
    return {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        restaurantId: { type: "string", minLength: 1, maxLength: 255 },
        tableNumber: { type: "integer" },
        capacity: { type: "integer" },
        
      },
    };
  }

  
  static get relationMappings() {
    return {
      restaurant: {
        relation: BaseModel.HasManyRelation,
        modelClass: RestaurantModel,
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

export type TableModelType = ModelObject<TableModel>;
