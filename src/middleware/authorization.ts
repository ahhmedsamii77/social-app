import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils";

export function authorization(accessRoles = [] as string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!accessRoles.includes(req.user?.role!)) throw new AppError("unauthorized", 401);
    return next();
  }
}