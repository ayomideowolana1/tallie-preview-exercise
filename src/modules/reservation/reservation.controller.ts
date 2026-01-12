import { Request, Response } from "express";
import { ReservationService } from "./reservation.service";
import { showGenericResponse } from "../../shared/utils/response.util";
import { AppError } from "../../shared/error/app.error";
import { ReservationModelType } from "../../models/reservation.model";
import { TableService } from "../table/table.service";
import status from "http-status";
import { dateRegex } from "../../shared/utils/regex";

export class ReservationController {
  private reservationService: ReservationService;
  private tableService: TableService;

  constructor() {
    this.reservationService = new ReservationService();
    this.tableService = new TableService();
  }

  getRestaurantReservations = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query as {date:string}

      if(date && !dateRegex.test(date)){
        throw new AppError(status.BAD_REQUEST,'date must be in YYYY-MM-DD format')
      }

      const reservations =
        await this.reservationService.getRestaurantReservations(restaurantId,date);

      return showGenericResponse({
        response: res,
        status: true,
        data: reservations,
        message: "Reservations fetched successfully",
      });
    } catch (error: any) {
      showGenericResponse({
        response: res,
        status: false,
        message:
          error instanceof AppError
            ? error.message
            : "Failed to fetch reservations",
        errorStatusCode: error instanceof AppError ? error.statusCode : 500,
      });
    }
  };

  createReservation = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body as Partial<ReservationModelType>;

      // validate time slot availability
       const availabilityCheck = await this.tableService.checkTableAvailability(
        payload.date as string,
        payload.startTime as string,
        payload.tableId as string,
        Number(payload.partySize),
        Number(payload.duration)
      );

      if(!availabilityCheck.available){
        throw new AppError(status.BAD_REQUEST, availabilityCheck.message)
      }

      console.log(availabilityCheck)

      const reservation = await this.reservationService.createReservation(
        payload
      );

      return showGenericResponse({
        response: res,
        status: true,
        data: reservation,
        message: "Reservation created successfully",
      });
    } catch (error: any) {
      console.log(error)
      showGenericResponse({
        response: res,
        status: false,
        message:
          error instanceof AppError
            ? error.message
            : "Failed to create reservation",
        errorStatusCode: error instanceof AppError ? error.statusCode : 500,
      });
    }
  };
}
