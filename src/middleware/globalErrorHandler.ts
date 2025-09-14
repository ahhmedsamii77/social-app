import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils";

export function globalErrorHandler(error: AppError, req: Request, res: Response, next: NextFunction) {
  return res.status(error.statusCode || 500).json({ message: error.message, stack: error.stack });
}