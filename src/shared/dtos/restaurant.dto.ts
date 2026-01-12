import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsEnum,
  Matches,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import {
  IsTimeBeforeCloseTime,
  HasUniqueDays,
} from "../validators/business-hours.validator";
import "reflect-metadata";
import { timeRegex } from "../utils/regex";

export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

export class BusinessHourDto {
  @IsEnum(DayOfWeek, { message: "dayOfWeek must be a valid day of the week" })

  dayOfWeek!: DayOfWeek;

  @IsBoolean({ message: "open must be a boolean" })
  isOpen!: boolean;

  @ValidateIf((o) => o.isOpen === true)
  @IsString({ message: "openTime must be a string" })
  @Matches(timeRegex, {
    message: "openTime must be in HH:mm format (e.g., 09:00, 23:30)",
  })
  @IsTimeBeforeCloseTime({ message: "openTime must be before closeTime" })
  openTime!: string;

  @ValidateIf((o) => o.isOpen === true)
  @IsString({ message: "closeTime must be a string" })
  @Matches(timeRegex, {
    message: "closeTime must be in HH:mm format (e.g., 09:00, 23:30)",
  })
  closeTime!: string;
}

export class CreateRestaurantDto {
  @IsString({ message: "name must be a string" })
  @MinLength(1, { message: "name must be at least 1 character long" })
  @MaxLength(255, { message: "name must not exceed 255 characters" })
  name!: string;


  @IsArray({ message: "businessHours must be an array" })
  @ArrayMinSize(7, { message: "businessHours must include all 7 days of the week" })
  @ArrayMaxSize(7, { message: "businessHours must include exactly 7 days" })
  @ValidateNested({ each: true })
  @Type(() => BusinessHourDto)
  @HasUniqueDays({ message: "businessHours must have unique days (no duplicates)" })
  businessHours!: BusinessHourDto[];
}
