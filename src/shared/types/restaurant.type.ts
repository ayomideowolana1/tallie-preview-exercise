export type Restaurant = {
  name: string;
};

export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

export type BusinessHour = {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export type BusinessHours = BusinessHour[];

export type CreateRestaurantDTO = Restaurant & { businessHours: BusinessHours };
