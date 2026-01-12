import {
  IsNotEmpty,
  IsInt,
  Min,
  IsString,
  IsDateString,
  Matches,
} from "class-validator";
import { dateRegex, timeRegex } from "../utils/regex";

export class CreateReservationDto {
  @IsNotEmpty({ message: "tableId cannot be empty" })
  @IsString({ message: "tableId must be a string" })
  tableId!: string;

  @IsInt({ message: "partySize must be an integer" })
  @Min(1, { message: "partySize must be at least 1" })
  partySize!: number;

  @IsInt({ message: "duration must be an integer" })
  @Min(1, { message: "duration must be at least 1" })
  duration!: number;

  @IsDateString({}, { message: "date must be a valid ISO date" })
  @Matches(dateRegex, {
    message: "date must be in YYYY-MM-DD format",
  })
  date: string;

  @IsString({ message: "startTime must be a string" })
  @Matches(timeRegex, {
    message: "startTime must be in HH:mm format (e.g., 09:00, 23:30)",
  })
  startTime!: string;

  @IsNotEmpty({ message: "phone cannot be empty" })
  @IsString({ message: "phone must be a string" })
  phone!: string;
  
  @IsNotEmpty({ message: "customerName cannot be empty" })
  @IsString({ message: "customerName must be a string" })
  customerName!: string;
}
