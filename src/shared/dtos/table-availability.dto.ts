import {
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  Matches,
  Min,
  Max,
} from "class-validator";
import { dateRegex, timeRegex } from "../utils/regex";

export class TableAvailabilityDto {
  @IsNotEmpty({ message: "tableId cannot be empty" })
  @IsString({ message: "tableId must be a string" })
  tableId!: string;

  @IsDateString({}, { message: "date must be a valid ISO date" })
  @Matches(dateRegex, {
    message: "date must be in YYYY-MM-DD format",
  })
  date: string;

  @IsString({ message: "time must be a string" })
  @Matches(timeRegex, {
    message: "time must be in HH:mm format (e.g., 09:00, 23:30)",
  })
  time!: string;

  @IsNumber()
  @Min(1, { message: "capacity must be at least 1" })
  capacity?: number;

  @IsNumber()
  @Min(1, { message: "duration must be at least 1" })
  @Max(1440, { message: "duration must not exceed 1440" })
  duration?: number;
}
