import dotenv from "dotenv";
dotenv.config();

type LogLevel = "info" | "error" | "warn" | "debug";

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage("info", message, meta));
  }

  error(meta: any, message: string, details?: any): void {
    const errorMessage = this.formatMessage("error", message, { ...meta, ...details });
    console.error(errorMessage);
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage("warn", message, meta));
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }
}

export default new Logger();