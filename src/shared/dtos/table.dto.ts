import { IsNotEmpty, IsInt, Min, IsString } from "class-validator";

export class AddTableDto {
  @IsNotEmpty({ message: "restaurantId cannot be empty" })
  @IsString({ message: "restaurantId must be a string" })
  restaurantId!: string;

  @IsInt({ message: "capacity must be an integer" })
  @Min(1, { message: "capacity must be at least 1" })
  capacity!: number;
}
