import { NextFunction, Request, Response } from "express";
import { AppError, decodeTokenAndFetchUser, getSignature, TokenType } from "../utils";

export function authentication(tokenType: TokenType = TokenType.ACCESS) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) throw new AppError("unauthorized", 401);
    const [prefix, token] = authorization.split(" ");
    if (!prefix || !token) throw new AppError("unauthorized", 401);
    const signature = await getSignature({ tokenType, prefix });
    if (!signature) throw new AppError("unauthorized", 401);
    const { user, decoded } = await decodeTokenAndFetchUser({ token, signature });
    req.user = user;
    req.decoded = decoded;
    return next();
  }
}