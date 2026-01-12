import { Request, Response } from "express";
import { TableService } from "./table.service";
import { showGenericResponse } from "../../shared/utils/response.util";
import { AppError } from "../../shared/error/app.error";
import { ReservationModelType } from "../../models/reservation.model";
import { TableAvailabilityDto } from "../../shared/dtos/table-availability.dto";

export class TableController {
  private tableService: TableService;

  constructor() {
    this.tableService = new TableService();
  }

  addTableToRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await this.tableService.addTableToRestaurant(req.body);

      return showGenericResponse({
        response: res,
        status: true,
        data: response,
        message: "Table added to restaurant successfully",
      });
    } catch (error: any) {
      showGenericResponse({
        response: res,
        status: false,
        message:
          error instanceof AppError
            ? error.message
            : "Failed to add table to restaurant",
        errorStatusCode: error instanceof AppError ? error.statusCode : 500,
      });
    }
  };

  checkTableAvailability = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { date, time, tableId, capacity, duration } = req.body;
      const response = await this.tableService.checkTableAvailability(
        date,
        time,
        tableId,
        capacity,
        duration
      );

      return showGenericResponse({
        response: res,
        status: true,
        data: response,
        message: "Table availability checked successfully",
      });
    } catch (error: any) {
      showGenericResponse({
        response: res,
        status: false,
        message:
          error instanceof AppError
            ? error.message
            : "Failed to check table availability",
        errorStatusCode: error instanceof AppError ? error.statusCode : 500,
      });
    }
  };
}
