import { Router } from "express";
import * as UV from "./user.validation";
import US from "./user.service";
import { validation } from "../../middleware/index";
export const userRouter = Router();

userRouter.post("/singup", validation(UV.SignupSchema), US.sigUp);