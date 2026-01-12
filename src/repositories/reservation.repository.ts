import db from "../db/knex";
import {
  ReservationModel,
  ReservationModelType,
} from "../models/reservation.model";

import { Transaction } from "objection";
import { BaseRepository } from "./base.repository";

export class ReservationRepository extends BaseRepository<
  ReservationModelType,
  ReservationModel
> {
  private tableName = "restaurant_reservations";

  constructor() {
    super(ReservationModel);
  }

  async findByRestaurantId(restaurantId: string,date?:string): Promise<ReservationModel[]> {
    const query = ReservationModel.query().where({ restaurantId })
    if(date){
      query.andWhere({date})
      console.log(date)
    }
    return await query
  }

  async getTableReservationsByDate(tableId: string, date: string) {
    return await ReservationModel.query().where({ tableId, date });
  }

  async checkAvailability(
    tableId: string,
    date: string,
    startTime: string,
    endTime: string,
    capacity: number,
    duration: number
  ) {
    return await ReservationModel.query()
      .where({ tableId, date })
      .andWhereBetween("startTime", [startTime, endTime]);
  }
}
