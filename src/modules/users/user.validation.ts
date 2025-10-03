import z, { email } from "zod";
import { FlagType, GenderType } from "../../utils";
export const signupSchema = {
  body: z.strictObject({
    fullName: z.string().min(3, { message: "full name must be at least 3 characters long" }),
    password: z.string().min(6, { message: "password must be at least 6 characters long" }),
    email: z.email({ message: "invalid email" }),
    age: z.number().min(18, { message: "age must be at least 18" }),
    phone: z.string().min(10, { message: "phone number must be at least 10 characters long" }).regex(/^(20)?01[0125][0-9]{8}$/, { message: "invalid phone number" }),
    address: z.string().min(3, { message: "address must be at least 3 characters long" }).optional(),
    profileImage: z.string().optional(),
    confirmPassword: z.string().min(6, { message: "password must be at least 6 characters long" }),
    gender: z.enum([GenderType.MALE, GenderType.FEMALE]).optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  })
}

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum([FlagType.Current, FlagType.All])
  })
}


export const confirmEmailSchema = {
  body: z.strictObject({
    email: z.email({ message: "invalid email" }).optional(),
    otp: z.string().min(6, { message: "otp must be at least 6 characters long" }).optional(),
  })
}


export const signinSchema = {
  body: z.strictObject({
    email: z.email({ message: "invalid email" }),
    password: z.string().min(6, { message: "password must be at least 6 characters long" })
  })
}


export const updatePasswordSchema = {
  body: z.strictObject({
    oldPassword: z.string().min(6, { message: "password must be at least 6 characters long" }),
    newPassword: z.string().min(6, { message: "password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, { message: "password must be at least 6 characters long" }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  })
}


export const forgetPasswordSchema = {
  body: z.strictObject({
    email: z.email({ message: "invalid email" }),
  })
}

export const resetPasswordSchema = {
  body: z.strictObject({
    password: z.string().min(6, { message: "password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, { message: "password must be at least 6 characters long" }),
    otp: z.string().min(6, { message: "otp must be at least 6 characters long" }),
    email: z.email({ message: "invalid email" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  })
}


export const updateProfileSchema = {
  body: z.strictObject({
    fullName: z.string().min(3, { message: "full name must be at least 3 characters long" }).optional(),
    age: z.number().min(18, { message: "age must be at least 18" }).optional(),
    phone: z.string().min(10, { message: "phone number must be at least 10 characters long" }).regex(/^(20)?01[0125][0-9]{8}$/, { message: "invalid phone number" }).optional(),
    address: z.string().min(3, { message: "address must be at least 3 characters long" }).optional(),
    gender: z.enum([GenderType.MALE, GenderType.FEMALE]).optional(),
    email: z.email({ message: "invalid email" }).optional(),
  })
}