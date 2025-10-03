import jwt, { JwtPayload } from "jsonwebtoken"
import { TokenType } from "../types";
import { UserRepository } from "../../DB/repositories/user.repository";
import { userModel } from "../../DB/models/user.model";
import { AppError } from "../classError";
import { RevokeTokenRepository } from "../../DB/repositories/revokeToken.repository";
import { revokeTokenModel } from "../../DB/models/revokeToken.model";
import { v4 as uuid } from "uuid"
const _userModel = new UserRepository(userModel);
const _revokeTokenModel = new RevokeTokenRepository(revokeTokenModel);
export async function generateToken({ payload, signature, options }: { payload: Object, signature: string, options: object }) {
  return jwt.sign(payload, signature, options);
}

export async function verifyToken({ token, signature }: { token: string, signature: string }): Promise<JwtPayload> {
  return jwt.verify(token, signature) as JwtPayload;
}

export async function getSignature({ tokenType, prefix }: { tokenType: TokenType, prefix: string }) {
  if (tokenType == TokenType.ACCESS) {
    if (prefix == process.env.USER_PREFIX) {
      return process.env.ACCESS_USER_SECRET_KEY;
    } else if (prefix == process.env.ADMIN_PREFIX) {
      return process.env.ACCESS_ADMIN_SECRET_KEY;
    } else {
      return null;
    }
  } else if (tokenType == TokenType.REFRESH) {
    if (prefix == process.env.USER_PREFIX) {
      return process.env.REFRESH_USER_SECRET_KEY;
    } else if (prefix == process.env.ADMIN_PREFIX) {
      return process.env.REFRESH_ADMIN_SECRET_KEY;
    } else {
      return null;
    }
  } else {
    return null;
  }
}


export async function decodeTokenAndFetchUser({ token, signature }: { token: string, signature: string }) {
  const decoded = await verifyToken({ token, signature });
  const isRevokd = await _revokeTokenModel.findOne({ idToken: decoded.jti });
  if (isRevokd) throw new AppError("token revoked.please login again", 401);
  const user = await _userModel.findById(decoded.id);
  if (!user) throw new AppError("user not found", 404);
  if (!user.confirmed) throw new AppError("user not confirmed", 401);
  if (user.changeCredentials! > new Date(decoded.iat! * 1000)) throw new AppError("user credentials changed.please login again", 401);
  if (user?.deletedAt) throw new AppError("user deleted.create a new account or contact admin", 401);
  return { user, decoded };
}


export async function generateOtp() {
  return uuid().replaceAll(/\D/g, "").slice(0, 6);
}