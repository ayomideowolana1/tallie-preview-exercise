export  class AppError extends Error {
  public statusCode: number;
  public cause: Error | undefined;
  public errorCode: string | undefined;
  public isOperational: boolean;

  constructor(statusCode: number, message:string, cause?: any, errorCode?: string, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.cause = cause as Error;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}