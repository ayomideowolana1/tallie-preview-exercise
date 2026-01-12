import { Request, Response } from "express";
import httpStatus from "http-status";
import logger from "./logger";
import { AppError } from "../error/app.error";

interface ResponseData {
  status?: boolean;
  response: Response;
  message?: string;
  data?: any;
  checks?: string[];
  errorCode?: any;
  errors?: any[];
  statusCode?: number;
  errorStatusCode?: number;
}

export const errorResponse = ({
  response,
  message,
  data,
  errors,
  checks,
  errorCode,
  statusCode,
}: ResponseData): void => {
  response.status(statusCode || errorCode || httpStatus.BAD_REQUEST).json({
    status: false,
    message,
    checks,
    data,
    errors,
  });
};

export const successfulResponse = ({
  response,
  data,
  message,
  checks,
}: ResponseData): void => {
  response.status(httpStatus.OK).json({
    status: true,
    message,
    data,
    checks,
  });
};

export const showGenericResponse = ({
  response,
  status,
  data,
  message,
  checks,
  errorCode,
  errorStatusCode = 400,
}: ResponseData): void => {
  const newData = data?.data ?? data;
  
  if (data?.status !== true && status !== true) {
    return errorResponse({
      response,
      message: message || data?.message,
      data: newData,
      statusCode: errorStatusCode,
      checks,
      errorCode,
    });
  }
  
  return successfulResponse({
    response,
    data: newData,
    message: message || data?.message,
    checks,
  });
};

export const errorHandler = (err: any, req: Request, res: Response): void => {
  if (res.headersSent) {
    return;
  }

  const errorCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message =
    err instanceof AppError
      ? err.message
      : "We are unable to process your request. Please try again";

  logger.error({ err }, `[GlobalErrorHandler] ===>`, {
    url: req.originalUrl,
    routeMethod: req.method ?? "N/A",
    message: err.message,
    body: req.body ?? "N/A",
    params: req.params ?? "N/A",
    query: req.query ?? "N/A",
    errResp: err?.response?.data ?? "N/A",
    errorCode,
  });

  return errorResponse({
    response: res,
    message,
    errors: err.errorCode,
    statusCode: errorCode,
    errorCode:
      err instanceof AppError && err.cause
        ? err.cause.message || err.cause
        : undefined,
  });
};

export const routeNotFound = (req: Request, res: Response): void => {
  errorResponse({
    response: res,
    message: "Oops! We can't find the url you are looking for",
    statusCode: httpStatus.NOT_FOUND,
  });
};