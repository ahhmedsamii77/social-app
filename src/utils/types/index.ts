import { Request } from "express";
import { ZodType } from "zod";
import z from "zod"
import { confirmEmailSchema, forgetPasswordSchema, logoutSchema, resetPasswordSchema, signinSchema, signupSchema, updatePasswordSchema, updateProfileSchema } from "../../modules/users/user.validation";
import { HydratedDocument, Types } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
export type UserType = {
  fullName?: string;
  fName: string;
  lName: string;
  email: string;
  password: string;
  age: number;
  phone: string;
  address?: string;
  profileImage?: string;
  tempProfileImage?: string;
  role?: RoleType;
  gender?: GenderType;
  otp?: string;
  confirmed?: boolean;
  provider?: ProviderType
  changeCredentials?: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  reStoredAt?: Date;
  reStoredBy?: Types.ObjectId;
  friends: Types.ObjectId[];
}


export type PostType = {
  content?: string;
  attachments?: string[];
  createdBy: Types.ObjectId;
  allowComments?: AllowCommentsType;
  availability?: AvailaabilityType;
  assetFolderId?: string;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  reStoredAt?: Date;
  reStoredBy?: Types.ObjectId;
  tags: Types.ObjectId[];
  likes: Types.ObjectId[];
}


export type CommentType = {
  content?: string;
  attachments?: string[];
  createdBy: Types.ObjectId;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  reStoredAt?: Date;
  reStoredBy?: Types.ObjectId;
  tags: Types.ObjectId[];
  likes: Types.ObjectId[];
  assetFolderId?: string;
  refId: Types.ObjectId;
  onModel: OnModelType;
}


export enum OnModelType {
  Post = "posts",
  Comment = "comments"
}

export enum AvailaabilityType {
  Public = "public",
  Private = "private",
  Friends = "friends"
}

export enum AllowCommentsType {
  Allow = "allow",
  Deny = "deny"
}


export type RevokeTokenType = {
  idToken: string;
  userId: Types.ObjectId;
  expireIn: Date;
}
export enum ProviderType {
  GOOGLE = "google",
  SYSTEM = "system"
}

export enum FlagType {
  Current = "current",
  All = "all"
}

export enum RoleType {
  ADMIN = "admin",
  USER = "user"
}

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh"
}

export enum GenderType {
  MALE = "male",
  FEMALE = "female"
}

declare module "express-serve-static-core" {
  interface Request {
    user?: HydratedDocument<UserType>;
    decoded?: JwtPayload
  }
}

export enum StoreType {
  LOCAL = "local",
  CLOUD = "cloud"
}

export enum ActionType {
  Like = "like",
  Dislike = "dislike"
}

export type ReqType = keyof Request;
export type SchemaType = Partial<Record<ReqType, ZodType>>;

export type SignupType = z.infer<typeof signupSchema.body>;
export type ConfirmEmailType = z.infer<typeof confirmEmailSchema.body>;
export type SigninType = z.infer<typeof signinSchema.body>;
export type LogoutType = z.infer<typeof logoutSchema.body>;
export type UpdatePasswordType = z.infer<typeof updatePasswordSchema.body>;
export type ForgetPasswordType = z.infer<typeof forgetPasswordSchema.body>;
export type ResetPasswordType = z.infer<typeof resetPasswordSchema.body>;
export type UpdateProfileType = z.infer<typeof updateProfileSchema.body>;
