import z from "zod";
export const generalRules = {
  email: z.email(),
  password: z.string().min(6),
}