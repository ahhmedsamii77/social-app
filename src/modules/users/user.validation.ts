import { sign } from "jsonwebtoken";
import z, { email } from "zod";
import { FlagType, GenderType } from "../../utils";
export const SigninSchema = {
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
}
export const SignupSchema = {
  body: SigninSchema.body.extend({
    fullName: z.string(),
    confirmPassword: z.string(),
    age: z.number(),
    phone: z.string(),
    address: z.string().optional(),
    image: z.string().optional(),
    gender: z.enum([GenderType.Male, GenderType.Female]).optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
}


export const ConfirmEmailSchema = {
  body: z.object({
    email: z.string(),
    otp: z.string().length(6),
  })
}



export const LoginWithGmailSchema = {
  body: z.object({
    idToken: z.string(),
  })
}


export const ForgetPassswordSchema = {
  body: z.object({
    email: z.string(),
  })
}

export const UpdatePassswordSchema = {
  body: z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
}


export const UpdateProfileSchema = {
  body: z.object({
    email: z.string().optional(),
    password: z.string().min(8).optional(),
    fullName: z.string().optional(),
    age: z.number().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    image: z.string().optional(),
    gender: z.enum([GenderType.Male, GenderType.Female]).optional(),
  })
}


export const LogoutSchema = {
  body: z.object({
    flag: z.enum([FlagType.All, FlagType.Current]),
  })
}


export const ResetPassswordSchema = {
  body: SigninSchema.body.extend({
    confirmPassword: z.string(),
    otp: z.string().length(6),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
}