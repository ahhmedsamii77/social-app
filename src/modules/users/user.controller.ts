import { Router } from "express";
import * as UV from "./user.validation";
import US from "./user.service"
import { allowedExtension, authentication, authorization, multerCloud, validation } from "../../middleware";
import { RoleType, TokenType } from "../../utils";
export const userRouter = Router();

// signup
userRouter.post("/signup", validation(UV.signupSchema), US.signUp);

// confirm email
userRouter.patch("/confirm-email", validation(UV.confirmEmailSchema), US.confirmEmail);

// signin
userRouter.post("/signin", validation(UV.signinSchema), US.signIn);

// login with google
userRouter.post("/google-signin", US.loginWithGmail);

// logout
userRouter.patch("/logout", authentication(), validation(UV.logoutSchema), US.logOut);

// refresh token
userRouter.get("/refresh-token", authentication(TokenType.REFRESH), US.refreshToken);

// update password
userRouter.patch("/update-password", authentication(), validation(UV.updatePasswordSchema), US.updatePassword);

// forget password
userRouter.post("/forget-password", validation(UV.forgetPasswordSchema), US.forgetPassword);

// reset password
userRouter.patch("/reset-password", validation(UV.resetPasswordSchema), US.resetPassword);

// update profile
userRouter.patch("/update-profile", authentication(), validation(UV.updateProfileSchema), US.updateProfile);

// uplaod profile image
userRouter.post("/upload-profile-image", authentication(),
  // multerCloud({ fileTypes: allowedExtension.image }).array("profileImages"),
  US.uploadImage);

// get user data
userRouter.get("/me", authentication(), US.getUserData);

// get profile
userRouter.get("/:userId", authentication(), US.getProfile);

// freeze account
userRouter.delete("/freeze-account{/:userId}", authentication(), US.freezeAccount);

// unfreeze account
userRouter.patch("/unfreeze-account/:userId", authentication(), authorization([RoleType.ADMIN]), US.unfreezeAccount);