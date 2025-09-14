import { Router } from "express";
import { authentication, validation } from "../../middleware";
import * as UV from "./user.validation";
import US from "./user.service";
import { TokenType } from "../../utils";
export const userRouter = Router();

// signup
userRouter.post("/signup", validation(UV.SignupSchema), US.signUp);

// confirm email
userRouter.patch("/confirmEmail", validation(UV.ConfirmEmailSchema), US.confirmEmail);

// signin
userRouter.post("/signin", validation(UV.SigninSchema), US.signIn);

// login with google
userRouter.post("/loginWithGmail", validation(UV.LoginWithGmailSchema), US.loginWithGmail);

// forget password
userRouter.patch("/forgetPassword", validation(UV.ForgetPassswordSchema), US.forgetPassword);

// reset password
userRouter.patch("/resetPassword", validation(UV.ResetPassswordSchema), US.resetPassword);

// logout
userRouter.patch("/logout", authentication(), validation(UV.LogoutSchema), US.logOut);

// refresh token
userRouter.get("/refreshToken", authentication(TokenType.Refresh), US.refreshToken);

// get profile
userRouter.get("/profile", authentication(), US.getProfile);

// update password
userRouter.patch("/updatePassword", authentication(), validation(UV.UpdatePassswordSchema), US.updatePassword);

// update profile
userRouter.patch("/updateProfile", authentication(), validation(UV.UpdateProfileSchema), US.updateProfile);