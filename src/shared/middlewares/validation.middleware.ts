import { errorResponse } from "../utils/response.util";

import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { DayOfWeek } from "../../models/business-hour.model";

interface FormattedError {
  field: string;
  message: string;
  value?: any;
  dayOfWeek?: DayOfWeek;
}

function extractDayOfWeek(path: string, errors: ValidationError[]): string | null {
  // Extract index from path like "businessHours[0]"
  const match = path.match(/\[(\d+)\]/);
  if (!match) return null;

  const index = parseInt(match[1]);
  
  // Try to find the dayOfWeek from the parent error
  const parentError = errors.find(e => e.property === "businessHours");
  if (parentError && parentError.value && Array.isArray(parentError.value)) {
    const dayObject = parentError.value[index];
    if (dayObject && dayObject.dayOfWeek) {
      return dayObject.dayOfWeek;
    }
  }
  
  return null;
}

function formatValidationErrors(
  errors: ValidationError[],
  parentPath: string = "",
  rootErrors: ValidationError[] = []
): FormattedError[] {
  const formattedErrors: FormattedError[] = [];

  if (!rootErrors.length) {
    rootErrors = errors;
  }

  errors.forEach((error) => {
    let fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    // Handle array index notation [0], [1], etc.
    if (/^\d+$/.test(error.property)) {
      fieldPath = `${parentPath}[${error.property}]`;
    }

    // Handle nested errors (like arrays)
    if (error.children && error.children.length > 0) {
      const childErrors = formatValidationErrors(error.children, fieldPath, rootErrors);
      formattedErrors.push(...childErrors);
    } else if (error.constraints) {
      // Get all constraint messages
      const constraintMessages = Object.values(error.constraints);
      
      constraintMessages.forEach((message) => {
        let finalMessage = message;
        let finalField = fieldPath;
        let dayOfWeek:DayOfWeek | undefined = undefined;

        // Check if this is a businessHours field error
        if (fieldPath.includes("businessHours")) {
          const _dayOfWeek = extractDayOfWeek(fieldPath, rootErrors);
          
          if (_dayOfWeek) {
            
            finalField = fieldPath.replace(/businessHours\[\d+\]\./, "");
            
            finalMessage = `${message}`;
            dayOfWeek = _dayOfWeek as DayOfWeek;
          }
        }

        formattedErrors.push({
          dayOfWeek: dayOfWeek,
          field: finalField,
          message: finalMessage,
          value: error.value !== undefined ? error.value : undefined,
        });
      });
    }
  });

  return formattedErrors;
}

export function validationMiddleware(
  type: any,
  source: "body" | "query" | "params" = "body"
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dataSource =
      source === "body"
        ? req.body
        : source === "query"
        ? req.query
        : req.params;

    const dto = plainToInstance(type, dataSource);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      validationError: {
        target: false, 
        value: true,   
      },
    });

    if (errors.length === 0) {
      req.body = dto;
      return next();
    }

    const formattedErrors = formatValidationErrors(errors);

    
    const errorCount = formattedErrors.length;
    const summaryMessage =
      errorCount === 1
        ? `Validation failed: ${formattedErrors[0].message}`
        : `Validation failed with ${errorCount} error${errorCount > 1 ? "s" : ""}`;

    errorResponse({
      response: res,
      message: summaryMessage,
      errors: formattedErrors,
      statusCode: httpStatus.BAD_REQUEST,
    });
  };
}