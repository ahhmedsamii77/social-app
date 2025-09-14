import { NextFunction, Request, Response } from "express";
import { AppError, ReqType, SchemaType } from "../utils";

export function validation(schema: SchemaType) {
  return (req: Request, res: Response, next: NextFunction) => {
    let validationErrors = [];
    for (const key of Object.keys(schema) as ReqType[]) {
      const result = schema[key]?.safeParse(req[key]);
      if (!result?.success) {
        validationErrors.push(result?.error);
      }
    }
    if (validationErrors.length) {
      throw new AppError(JSON.parse(validationErrors as unknown as string), 400);
    }
    return next();
  }
}