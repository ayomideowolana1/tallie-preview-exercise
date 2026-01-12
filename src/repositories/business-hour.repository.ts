import db from "../db/knex";
import {
  BusinessHourModel,
  BusinessHourModelType,
} from "../models/business-hour.model";
import { Transaction } from "objection";
import { BaseRepository } from "./base.repository";
import { DayOfWeek } from "../models/business-hour.model";

export class BusinessHourRepository extends BaseRepository<BusinessHourModelType,BusinessHourModel> {
  private tableName = "restaurant_business_hours";

  constructor() {
    super(BusinessHourModel);
  }


    async getBusinessHours(restaurantId:string, dayOfWeek:DayOfWeek): Promise<BusinessHourModel | undefined> {
      return await BusinessHourModel.query().findOne({restaurantId, dayOfWeek});
    }

  // async create(payload: Partial<BusinessHourModelType>, trx?: Transaction) {
  //   const query = BusinessHourModel.query(trx).insert(payload);
  //   console.log(query.toKnexQuery().toString())
  //   return await query
  // }
}
