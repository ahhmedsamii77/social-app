import jwt, { JwtPayload } from "jsonwebtoken";
import { TokenType } from "../types";
import { userModel, UserRepository } from "../../DB";
import { AppError } from "../classError";
import { RevokeTokenRepository } from "../../DB/repositories/revokeToken.repository";
import { revokeTokenModel } from "../../DB/models/revokeToken.model";
import { isReadable } from "nodemailer/lib/xoauth2";

const _userModel = new UserRepository(userModel);
const _revokeTokenModel = new RevokeTokenRepository(revokeTokenModel);
export async function generateToken({ payload, signature, options }: { payload: object, signature: string, options: jwt.SignOptions }): Promise<string> {
  return jwt.sign(payload, signature, options);
}

export async function verifyToken({ token, signature }: { token: string, signature: string }): Promise<JwtPayload> {
  return jwt.verify(token, signature) as JwtPayload;
}

export async function getSignature(tokenType: TokenType, prefix: string): Promise<string | null> {
  if (tokenType === TokenType.Access) {
    if (prefix == process.env.USER_PREFIX) {
      return process.env.ACCESS_JWT_SECRET_USER!;
    } else if (prefix == process.env.ADMIN_PREFIX) {
      return process.env.ACCESS_JWT_SECRET_ADMIN!;
    } else {
      return null;
    }
  } else if (tokenType === TokenType.Refresh) {
    if (prefix == process.env.USER_PREFIX) {
      return process.env.REFRESH_JWT_SECRET_USER!;
    } else if (prefix == process.env.ADMIN_PREFIX) {
      return process.env.REFRESH_JWT_SECRET_ADMIN!;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function fetchUserAndDecodeToken(token: string, signature: string) {
  const decoded = await verifyToken({ token, signature });
  const isRevoked = await _revokeTokenModel.findOne({ idToken: decoded.jti });
  if (isRevoked) {
    throw new AppError("Token revoked please login again", 400);
  }
  const user = await _userModel.findById(decoded.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (!user.confirmed) {
    throw new AppError("User not confirmed", 400);
  }
  if (user.changeCredentials! > new Date(decoded.iat! * 1000)) {
    throw new AppError("User credentials changed please login again", 400);
  }
  return { user, decoded };
}