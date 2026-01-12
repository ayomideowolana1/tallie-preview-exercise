import db from "../db/knex";
import { DayOfWeek } from "../models/business-hour.model";
import { RestaurantModel,RestaurantModelType } from "../models/restaurant.model";
import { Transaction } from 'objection';
import { BaseRepository } from "./base.repository";

export class RestaurantRepository extends BaseRepository<RestaurantModelType,RestaurantModel> {
  private tableName = "restaurants";
  constructor() {
      super(RestaurantModel);
    }

  async findAll(): Promise<RestaurantModel[]> {
    return await RestaurantModel.query().where({}).withGraphFetched('businessHours');
  }

  async findById(id:string): Promise<RestaurantModel | undefined> {
    return await RestaurantModel.query().findById(id).withGraphFetched('[businessHours,tables]');
  }

  
  async validateId(restaurantId: string, trx?: Transaction) {
    return await RestaurantModel.query(trx).findOne({id:restaurantId}).withGraphFetched('tables')
  }
}