import { ZodType } from "zod";
import { ConfirmEmailSchema, ForgetPassswordSchema, LoginWithGmailSchema, LogoutSchema, ResetPassswordSchema, SigninSchema, SignupSchema, UpdatePassswordSchema, UpdateProfileSchema } from "../../modules/users/user.validation";
import z from "zod";
import { Request } from "express";
import { HydratedDocument } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
export type UserType = {
  fullName?: string;
  fName: string;
  lName: string;
  email: string;
  password: string;
  age: number;
  phone: string;
  address?: string;
  image?: string;
  otp?: string;
  confirmed?: boolean;
  role?: RoleType;
  gender?: GenderType;
  provider?: ProviderType;
  changeCredentials?: Date;
}

export type RevokeTokenType = {
  idToken: string;
  userId: Types.ObjectId;
  expiresAt: Date;
}
export enum GenderType {
  Male = "Male",
  Female = "Female"
}
export enum FlagType {
  All = "all",
  Current = "current"
}

export enum RoleType {
  User = "user",
  Admin = "admin"
}

export enum ProviderType {
  System = "system",
  Google = "google"
}

export enum TokenType {
  Access = "access",
  Refresh = "refresh"
}

export type ReqType = keyof Request;
export type SchemaType = Partial<Record<ReqType, ZodType>>;


declare module "express-serve-static-core" {
  interface Request {
    user?: HydratedDocument<UserType>;
    decoded?: JwtPayload;
  }
}


export type SignupType = z.infer<typeof SignupSchema.body>;
export type SigninType = z.infer<typeof SigninSchema.body>;
export type ConfirmEmailType = z.infer<typeof ConfirmEmailSchema.body>;
export type LoginWithGmailType = z.infer<typeof LoginWithGmailSchema.body>;
export type ForgetPassswordType = z.infer<typeof ForgetPassswordSchema.body>;
export type ResetPassswordType = z.infer<typeof ResetPassswordSchema.body>;
export type LogoutType = z.infer<typeof LogoutSchema.body>;
export type UpdatePassswordType = z.infer<typeof UpdatePassswordSchema.body>;
export type UpdateProfileType = z.infer<typeof UpdateProfileSchema.body>;
