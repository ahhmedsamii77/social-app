import { NextFunction, Request, Response } from "express";
import { AppError, fetchUserAndDecodeToken, getSignature, TokenType } from "../utils";

export function authentication(tokenType: TokenType = TokenType.Access) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new AppError("No token found", 400);
    }
    const [prefix, token] = authorization.split(" ");
    const signature = await getSignature(tokenType, prefix!);
    if (!signature) {
      throw new AppError("Invalid token", 400);
    }
    const { user, decoded } = await fetchUserAndDecodeToken(token!, signature);
    req.user = user;
    req.decoded = decoded;
    return next();
  }
}