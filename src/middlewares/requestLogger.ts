import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../utils/Logger.js";
import { randomUUID } from "crypto";

const logger = new AppLogger("RequestLogger");

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  res.setHeader("X-Request-Id", requestId);
  (res.locals as any).requestId = requestId;

  const headers = { ...req.headers } as Record<string, any>;
  if (headers.authorization) headers.authorization = "[REDACTED]";

  const ip = (req.headers["x-forwarded-for"] as string) || req.ip;
  const userAgent = req.headers["user-agent"];
  const referer = req.headers["referer"];

  const safeBody = typeof req.body === "object" ? req.body : undefined;
  logger.apiRequest(req.method, req.originalUrl, {
    requestId,
    ip,
    userAgent,
    referer,
    headers,
    params: req.params,
    query: req.query,
    body: safeBody,
  });

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  (res as any).json = (body: any) => {
    (res.locals as any).responseBody = body;
    try {
      return originalJson(body);
    } catch (e) {
      return originalJson(body);
    }
  };

  (res as any).send = (body: any) => {
    (res.locals as any).responseBody = body;
    try {
      return originalSend(body);
    } catch (e) {
      return originalSend(body);
    }
  };

  const logResponse = (event: "finish" | "close") => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const contentLength = res.getHeader("content-length");
    const responseHeaders = res.getHeaders();
    const responseBody = (res.locals as any).responseBody;

    const stringify = (value: any) => {
      try {
        const str = typeof value === "string" ? value : JSON.stringify(value);
        return str && str.length > 10000
          ? str.slice(0, 10000) + "... [truncated]"
          : str;
      } catch {
        return undefined;
      }
    };

    logger.apiResponse(req.method, req.originalUrl, statusCode, duration);
    logger.http("Response details", {
      requestId,
      event,
      statusCode,
      duration,
      contentLength,
      responseHeaders,
      responseBody: stringify(responseBody),
    });
  };

  res.on("finish", () => logResponse("finish"));
  res.on("close", () => logResponse("close"));

  next();
};
