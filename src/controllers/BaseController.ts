import { Request, Response } from "express";
import { validate, ValidationError } from "class-validator";
import { ApiResponse } from "../types/index.js";

export abstract class BaseController {
  protected async validateDto<T extends object>(
    dto: T
  ): Promise<ValidationError[]> {
    return validate(dto);
  }

  protected formatValidationErrors(
    errors: ValidationError[]
  ): { field: string; message: string }[] {
    return errors.map((error) => ({
      field: error.property,
      message: Object.values(error.constraints || {}).join(", "),
    }));
  }

  protected sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200
  ): Response {
    const response = data;
    return res.status(statusCode).json(response);
  }

  protected sendError(
    res: Response,
    message: string,
    statusCode: number = 500
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(statusCode).json(response);
  }

  protected sendValidationError(
    res: Response,
    errors: ValidationError[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: "Dados inválidos",
      data: this.formatValidationErrors(errors),
    };
    return res.status(400).json(response);
  }

  protected parseId(req: Request): number {
    const id = parseInt(req.params.id || "0");
    if (isNaN(id) || id <= 0) {
      throw new Error("ID inválido");
    }
    return id;
  }
}
