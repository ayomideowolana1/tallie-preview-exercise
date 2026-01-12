import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "isTimeBeforeCloseTime", async: false })
export class IsTimeBeforeCloseTimeConstraint implements ValidatorConstraintInterface {
  validate(openTime: string, args: ValidationArguments) {
    const object = args.object as any;
    const closeTime = object.closeTime;
    
    if (!object.isOpen || !openTime || !closeTime) {
      return true; 
    }
    
    const [openHours, openMinutes] = openTime.split(":").map(Number);
    const [closeHours, closeMinutes] = closeTime.split(":").map(Number);

    const openTotalMinutes = openHours * 60 + openMinutes;
    const closeTotalMinutes = closeHours * 60 + closeMinutes;



    return openTotalMinutes < closeTotalMinutes;
  }
  
  defaultMessage(args: ValidationArguments) {
    return "openTime must be before closeTime";
  }
}

export function IsTimeBeforeCloseTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimeBeforeCloseTimeConstraint,
    });
  };
}

@ValidatorConstraint({ name: "hasUniqueDays", async: false })
export class HasUniqueDaysConstraint implements ValidatorConstraintInterface {
  validate(businessHours: any[], args: ValidationArguments) {
    if (!Array.isArray(businessHours)) {
      return true;
    }

    const days = businessHours.map((hour) => hour.dayOfWeek);
    const uniqueDays = new Set(days);

    return days.length === uniqueDays.size;
  }

  defaultMessage(args: ValidationArguments) {
    return "businessHours must have unique days (no duplicates)";
  }
}

export function HasUniqueDays(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: HasUniqueDaysConstraint,
    });
  };
}