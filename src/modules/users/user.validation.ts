import z from "zod"
import { GenderType, generalRules } from "../../utils/index";
export const SignupSchema = {
  body: z.object({
    userName: z.string(),
    email: generalRules.email,
    password: generalRules.password,
    confirmPassword: generalRules.password,
    age: z.number().min(18).max(60),
    address: z.string(),
    phone: z.string(),
    gender: z.enum([GenderType.Male, GenderType.Female]),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "confirm password do not match",
    path: ["confirmPassword"],
  }),
};