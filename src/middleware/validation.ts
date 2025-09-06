import { NextFunction, Request, Response } from "express";
import { AppError, ReqType, SchemaType } from "../utils/index";
export function validation(schema: SchemaType) {
  return (req: Request, res: Response, next: NextFunction) => {
    let validationError = [];
    for (const key of Object.keys(schema) as ReqType[]) {
      const result = schema[key]?.safeParse(req[key]);
      if (!result?.success) {
        validationError.push(result?.error);
      }
    }
    if (validationError.length) {
      throw new AppError(JSON.parse(validationError as unknown as string) as string, 400);
    }
    return next();
  };
}
