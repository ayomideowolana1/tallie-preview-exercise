import { RestaurantRepository } from "../../repositories/restaurant.repository";
import { AppError } from "../../shared/error/app.error";

import status from "http-status";

import { AddTableDto } from "../../shared/dtos/table.dto";
import { TableRepository } from "../../repositories/table.repository";
import { ReservationRepository } from "../../repositories/reservation.repository";
import {
  convertToMinutes,
  convertToString,
  getDayOfWeek,
  mergeTimeSlots,
} from "../../shared/utils/time.util";
import console from "node:console";
import { BusinessHourRepository } from "../../repositories/business-hour.repository";
import { DayOfWeek } from "../../models/business-hour.model";
import { TableModel } from "../../models/table.model";
import { ReservationModel } from "../../models/reservation.model";

type Slot = {
  start: string;
  end: string;
  seatsLeft?: number;
};

export class TableService {
  private restaurantRepository: RestaurantRepository;
  private tableRepository: TableRepository;
  private reservationRepository: ReservationRepository;
  private businessHourRepository: BusinessHourRepository;

  constructor() {
    this.restaurantRepository = new RestaurantRepository();
    this.tableRepository = new TableRepository();
    this.reservationRepository = new ReservationRepository();
    this.businessHourRepository = new BusinessHourRepository();
  }

  async addTableToRestaurant(payload: AddTableDto) {
    const restaurantId = payload.restaurantId;
    const capacity = payload.capacity;

    const restaurant = await this.restaurantRepository.validateId(restaurantId);

    if (!restaurant) {
      throw new AppError(status.NOT_FOUND, "Invalid restaurant ID");
    }

    if (!restaurant.tables) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Faieled to fetch restaurant tables"
      );
    }

    const tableNumber = restaurant.tables.length + 1;

    const result = await this.tableRepository.create({
      restaurantId,
      capacity,
      tableNumber,
    });

    return result;
  }

  async checkTableAvailability(
    date: string,
    startTime: string,
    tableId: string,
    requestCapacity: number,
    duration: number
  ) {
    const table = await this.tableRepository.validateId(tableId);

    if (!table) {
      throw new AppError(status.NOT_FOUND, "Invalid table ID");
    }

    this.validateRequestedCapacity(table, requestCapacity);

    const { endTime, openTime, closeTime } =
      await this.validateRequestedTimeSlot(date, startTime, duration, table);

    const timeSlot = `${startTime} - ${endTime}`;

    // check if there are any reservations on this table for the given date and time slot
    const reservations = await this.reservationRepository.checkAvailability(
      tableId,
      date,
      startTime,
      endTime,
      requestCapacity,
      duration
    );

    const totalSeats = table.capacity;
    const reservationSlots = reservations.map((r) => ({
      start: r.startTime,
      end: r.endTime,
      seatsLeft: totalSeats - Number(r.partySize),
    }));
    const mergedReservationSlots = mergeTimeSlots(reservationSlots, totalSeats);

    const availableSeats = mergedReservationSlots.reduce(
      (seats, reservationSlot) => seats + Number(reservationSlot.seatsLeft),
      0
    );

    console.log(mergedReservationSlots);

    // const availableSeats = totalSeats - reservedSeats;

    let message = "";

    if (requestCapacity > availableSeats) {
      message = `Party size (${requestCapacity}) exceeds available table capacity (${availableSeats}) for this time slot: ${timeSlot}`;
    }

    if (!availableSeats) {
      message = `No seats available for this time slot: ${timeSlot}`;
    }

    const { openTimeSlots } = await this.getAvailableTimeSlots(
      tableId,
      requestCapacity,
      date,
      duration,
      table.capacity,
      openTime,
      closeTime
    );

    return {
      available: availableSeats >= requestCapacity,
      availableSeats,
      timeSlot,
      message,
      openTimeSlots,
    };
  }

  private validateRequestedCapacity(
    table: TableModel,
    requestedCapacity: number
  ) {
    if (table.capacity < requestedCapacity) {
      throw new AppError(
        status.BAD_REQUEST,
        `Table capacity is ${table.capacity}, which is less than requested capacity of ${requestedCapacity}`
      );
    }
  }

  private async validateRequestedTimeSlot(
    date: string,
    startTime: string,
    duration: number,
    table: TableModel
  ) {
    //validate request time against restaurant operating hours for the day
    const dayOfWeek: DayOfWeek = getDayOfWeek(date);

    const restarantBusinessHours =
      await this.businessHourRepository.getBusinessHours(
        table.restaurantId,
        dayOfWeek
      );

    if (!restarantBusinessHours) {
      throw new AppError(
        status.NOT_FOUND,
        "Error fetching restaurant business hours"
      );
    }

    if (!restarantBusinessHours.isOpen) {
      throw new AppError(
        status.BAD_REQUEST,
        `Restaurant is closed on ${dayOfWeek}`
      );
    }

    const startTimeInMinutes = convertToMinutes(startTime);
    const endTimeInMinutes = startTimeInMinutes + duration;
    const endTime = convertToString(endTimeInMinutes);

    console.log(startTimeInMinutes, endTimeInMinutes, endTime, duration);

    if (endTimeInMinutes > 24 * 60) {
      throw new AppError(
        status.BAD_REQUEST,
        `Invalid request duration. Requested end time is ${endTime}`
      );
    }

    // compare request start and end time with restaurant operating hours
    const restaurantOpenTimeInMinutes = convertToMinutes(
      restarantBusinessHours?.openTime
    );
    const restaurantCloseTimeInMinutes = convertToMinutes(
      restarantBusinessHours?.closeTime
    );

    if (
      startTimeInMinutes < restaurantOpenTimeInMinutes ||
      endTimeInMinutes > restaurantCloseTimeInMinutes
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        `Restaurant is closed during the requested time slot ${startTime} - ${endTime}. Operating hours are ${restarantBusinessHours.openTime} - ${restarantBusinessHours.closeTime}`
      );
    }

    return {
      endTime,
      dayOfWeek,
      openTime: restarantBusinessHours.openTime,
      closeTime: restarantBusinessHours.closeTime,
    };
  }

  private async getAvailableTimeSlots(
    tableId: string,
    partySize: number,
    date: string,
    duration: number,
    availableSeats: number,
    openTime: string,
    closeTime: string
  ) {
    const reservations =
      await this.reservationRepository.getTableReservationsByDate(
        tableId,
        date
      );

    const bookedSlots = reservations.map((r: ReservationModel) => ({
      start: r.startTime,
      end: r.endTime,
      seatsLeft: availableSeats - Number(r.partySize),
    }));

    const mergedSlots = mergeTimeSlots(bookedSlots, availableSeats);

    const allSlots = this.generateTimeSlots(openTime, closeTime, duration);

    const availableSlots = this.filterAvailableSlots(
      allSlots,
      mergedSlots,
      partySize,
      availableSeats
    );

    const openTimeSlots = availableSlots.filter((s) => s.canFitParty);

    return { openTimeSlots, mergedSlots };
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number
  ) {
    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    const timeSlots = [];
    let currentTime = startMinutes;

    while (currentTime + duration <= endMinutes) {
      const slotStart = convertToString(currentTime);
      const slotEnd = convertToString(currentTime + duration);
      timeSlots.push({ start: slotStart, end: slotEnd });
      currentTime += duration;
    }

    return timeSlots;
  }

  private filterAvailableSlots(
    existingSlots: Slot[],
    bookedSlots: Slot[],
    partySize: number,
    availableSeats: number
  ) {
    return existingSlots.map((existingSlot) => {
      const existingStart = convertToMinutes(existingSlot.start);
      const existingEnd = convertToMinutes(existingSlot.end);

      // Default: all seats available
      let slotAvailableSeats = availableSeats;

      bookedSlots.forEach((bookedSlot) => {
        const bookedStart = convertToMinutes(bookedSlot.start);
        const bookedEnd = convertToMinutes(bookedSlot.end);

        const seatsLeft = bookedSlot.seatsLeft ?? availableSeats;

        // Check for overlap
        const timeOverlap =
          existingStart < bookedEnd && existingEnd > bookedStart;

        if (timeOverlap) {
          const seatsAlreadyBooked = availableSeats - seatsLeft;

          // Reduce availability for this slot
          slotAvailableSeats = Math.max(
            slotAvailableSeats - seatsAlreadyBooked,
            0
          );
        }
      });

      return {
        ...existingSlot,
        availableSeats: slotAvailableSeats,
        canFitParty: slotAvailableSeats >= partySize,
      };
    });
  }
}
