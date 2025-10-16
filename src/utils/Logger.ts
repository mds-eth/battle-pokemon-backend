import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console({
    format,
  }),

  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  new DailyRotateFile({
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

const Logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

export class AppLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(message: string, data?: any): string {
    const baseMessage = `[${this.context}] ${message}`;
    return data
      ? `${baseMessage} | Data: ${JSON.stringify(data)}`
      : baseMessage;
  }

  info(message: string, data?: any): void {
    Logger.info(this.formatMessage(message, data));
  }

  error(message: string, error?: Error | any, data?: any): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    Logger.error(
      this.formatMessage(message, {
        error: errorMessage,
        stack,
        data,
      })
    );
  }

  warn(message: string, data?: any): void {
    Logger.warn(this.formatMessage(message, data));
  }

  debug(message: string, data?: any): void {
    Logger.debug(this.formatMessage(message, data));
  }

  http(message: string, data?: any): void {
    Logger.http(this.formatMessage(message, data));
  }

  methodStart(methodName: string, params?: any): void {
    this.debug(`Starting ${methodName}`, params ? { params } : undefined);
  }

  methodEnd(methodName: string, result?: any): void {
    this.debug(
      `Completed ${methodName}`,
      result ? { result: "success" } : undefined
    );
  }

  methodError(methodName: string, error: Error | any): void {
    this.error(`Error in ${methodName}`, error);
  }

  databaseQuery(query: string, params?: any): void {
    this.debug(`Database query executed`, { query, params });
  }

  databaseError(query: string, error: Error | any): void {
    this.error(`Database query failed`, error, { query });
  }

  apiRequest(method: string, url: string, params?: any): void {
    this.http(`${method} ${url}`, params);
  }

  apiResponse(
    method: string,
    url: string,
    statusCode: number,
    duration?: number
  ): void {
    this.http(
      `${method} ${url} - ${statusCode}`,
      duration ? { duration: `${duration}ms` } : undefined
    );
  }
}

export default Logger;
