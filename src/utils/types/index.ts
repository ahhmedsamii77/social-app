import { Request } from "express"
import { ZodType } from "zod"
import z from "zod"
import { SignupSchema } from "../../modules/users/user.validation";
import { Types } from "mongoose";

export type ReqType = keyof Request;

export type SchemaType = Partial<Record<ReqType, ZodType>>;

export type SignupType = z.infer<typeof SignupSchema.body>;

export enum GenderType {
  Male = "male",
  Female = "female"
}

export enum RoleType {
  Admin = "Admin",
  User = "User"
}

export type UserType = {
  fName: string;
  lName: string;
  userName?: string;
  email: string;
  password: string;
  age: number;
  address?: string;
  phone?: string;
  gender: GenderType;
  role?: RoleType;
};