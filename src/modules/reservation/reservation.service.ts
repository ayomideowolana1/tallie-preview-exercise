import { RestaurantModelType } from "../../models/restaurant.model";
import { RestaurantRepository } from "../../repositories/restaurant.repository";
import { AppError } from "../../shared/error/app.error";

import status from "http-status";
import { databaseTransaction } from "../../shared/utils/database-transaction";

import { BusinessHourRepository } from "../../repositories/business-hour.repository";
import { ReservationRepository } from "../../repositories/reservation.repository";
import { ReservationModelType } from "../../models/reservation.model";
import { TableRepository } from "../../repositories/table.repository";
import { convertToMinutes, convertToString } from "../../shared/utils/time.util";

export class ReservationService {
  private restaurantRepository: RestaurantRepository;
  private businessHourRepository: BusinessHourRepository;
  private reservationRepository: ReservationRepository;
  private tableRepository: TableRepository;

  constructor() {
    this.restaurantRepository = new RestaurantRepository();
    this.businessHourRepository = new BusinessHourRepository();
    this.reservationRepository = new ReservationRepository();
    this.tableRepository = new TableRepository();
  }

  async getRestaurantReservations(restaurantId: string,date?:string) {
    const restaurant = await this.restaurantRepository.validateId(restaurantId);

    if (!restaurant) {
      throw new AppError(status.BAD_REQUEST, "Invalid restaurant ID");
    }

    const reservations = await this.reservationRepository.findByRestaurantId(
      restaurantId,date
    );

    return reservations;
  }

  async createReservation(payload: Partial<ReservationModelType>) {
    
    const endTimeInMinutes = convertToMinutes(payload.startTime as string) + Number(payload.duration!)
    const endTimeString = convertToString(endTimeInMinutes) 
    if(!endTimeString){
      throw new AppError(status.BAD_REQUEST,"Invalid time format")
    }
    payload.endTime = endTimeString

    const table = await this.tableRepository.findById(payload.tableId!)

    payload.restaurantId = table?.restaurantId

    return await this.reservationRepository.create(payload);
    
  }

  async getRestaurantReservationsByDate(restaurantId: string,date:string) {
    const restaurant = await this.restaurantRepository.validateId(restaurantId);

    if (!restaurant) {
      throw new AppError(status.BAD_REQUEST, "Invalid restaurant ID");
    }

    const reservations = await this.reservationRepository.findByRestaurantId(
      restaurantId
    );

    return reservations;
  }
}
