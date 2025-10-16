import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../utils/Logger.js";

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const logger = new AppLogger("ErrorHandler");
  const requestId = (res.locals as any)?.requestId;
  logger.error("Unhandled error", error, { requestId });

  const status = error.statusCode || 500;
  const message = error.message || "Erro interno do servidor";

  res.status(status).json({
    success: false,
    error: message,
    requestId,
  });
};
