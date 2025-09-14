import { NextFunction, Request, Response } from "express";
import { userModel, UserRepository } from "../../DB";
import { AppError, Compare, ConfirmEmailType, Decrypt, Encrypt, eventEmitter, FlagType, ForgetPassswordType, generateToken, Hash, LoginWithGmailType, LogoutType, ProviderType, ResetPassswordType, RoleType, SigninType, SignupType, UpdatePassswordType, UpdateProfileType } from "../../utils";
import { v4 as uuid } from "uuid"
import { OAuth2Client, TokenPayload } from "google-auth-library"
import { RevokeTokenRepository } from "../../DB/repositories/revokeToken.repository";
import { revokeTokenModel } from "../../DB/models/revokeToken.model";
class UserService {
  private _userModel = new UserRepository(userModel);
  private _revokeTokenModel = new RevokeTokenRepository(revokeTokenModel);
  constructor() { }

  // signup
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password, age, phone, address }: SignupType = req.body;
    const isUserExist = await this._userModel.findOne({ email });
    if (isUserExist) {
      throw new AppError("User already exist", 400);
    }
    const hahsedPassword = await Hash(password);
    const encryptedPhone = await Encrypt({ plainText: phone, signature: process.env.SECRET_KEY! });
    const otp = uuid().replaceAll(/\D/g, "").slice(0, 6);
    const hashedOpt = await Hash(otp);
    eventEmitter.emit("confirmEmail", { email, otp });
    const user = await this._userModel.create({ fullName: fullName!, email: email!, password: hahsedPassword!, age: age!, phone: encryptedPhone!, address: address!, otp: hashedOpt! });
    res.status(201).json({ message: "User created successfully", user });
  }

  // confirm email
  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp }: ConfirmEmailType = req.body;
    const user = await this._userModel.findOne({ email, confirmed: { $exists: false } });
    if (!user) {
      throw new AppError("User not found or already confirmed", 404);
    }
    const isMatch = await Compare(otp, user.otp!);
    if (!isMatch) {
      throw new AppError("Invalid OTP", 400);
    }
    user.confirmed = true;
    user.otp = undefined!;
    await user.save();
    res.status(200).json({ message: "Email confirmed successfully" });
  }

  // signIn
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: SigninType = req.body;
    const user = await this._userModel.findOne({ email, confirmed: true });
    if (!user) {
      throw new AppError("User not found or not confirmed", 404);
    }
    const isMatch = await Compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid password", 400);
    }
    const jwtid = uuid();
    const access_token = await generateToken({
      payload: { id: user._id, role: user.role },
      signature: user.role == RoleType.User ? process.env.ACCESS_JWT_SECRET_USER! : process.env.ACCESS_JWT_SECRET_ADMIN!,
      options: { expiresIn: "1d", jwtid }
    });
    const refresh_token = await generateToken({
      payload: { id: user._id, jwtid },
      signature: user.role == RoleType.User ? process.env.REFRESH_JWT_SECRET_USER! : process.env.REFRESH_JWT_SECRET_ADMIN!,
      options: { expiresIn: "7d", jwtid }
    });
    res.status(200).json({ message: "User logged in successfully", access_token, refresh_token });
  }

  // login with gmail
  loginWithGmail = async (req: Request, res: Response, next: NextFunction) => {
    const { idToken }: LoginWithGmailType = req.body;
    const client = new OAuth2Client();
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });
      const payload = ticket.getPayload();
      return payload;
    }
    const { name, email, picture, email_verified } = await verify() as TokenPayload;
    let user = await this._userModel.findOne({ email, confirmed: true });
    if (!user) {
      user = await this._userModel.create({
        fullName: name!, email: email!, image: picture!, confirmed: email_verified!,
        provider: ProviderType.Google!
      });
    }
    if (user.provider != ProviderType.Google) {
      throw new AppError("please login with google", 400);
    }
    const jwtid = uuid();
    const access_token = await generateToken({
      payload: { id: user._id, role: user.role },
      signature: user.role == RoleType.User ? process.env.ACCESS_JWT_SECRET_USER! : process.env.ACCESS_JWT_SECRET_ADMIN!,
      options: { expiresIn: "1d", jwtid }
    });
    const refresh_token = await generateToken({
      payload: { id: user._id, jwtid },
      signature: user.role == RoleType.User ? process.env.REFRESH_JWT_SECRET_USER! : process.env.REFRESH_JWT_SECRET_ADMIN!,
      options: { expiresIn: "7d", jwtid }
    });
    res.status(200).json({ message: "User logged in successfully", access_token, refresh_token });
  }

  // forget password
  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: ForgetPassswordType = req.body;
    const user = await this._userModel.findOne({ email, confirmed: true, otp: { $exists: false } });
    if (!user) {
      throw new AppError("User not found or not confirmed", 404);
    }
    const otp = uuid().replaceAll(/\D/g, "").slice(0, 6);
    const hashedOtp = await Hash(otp);
    eventEmitter.emit("forgetPassword", { email, otp });
    user.otp = hashedOtp;
    await user.save();
    return res.status(200).json({ message: "OTP sent successfully" });
  }

  // reset password
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, password }: ResetPassswordType = req.body;
    const user = await this._userModel.findOne({ email, confirmed: true, otp: { $exists: true } });
    if (!user) {
      throw new AppError("User not found or not confirmed", 404);
    }
    const isMatch = await Compare(otp, user.otp!);
    if (!isMatch) {
      throw new AppError("Invalid OTP", 400);
    }
    const hashedPassword = await Hash(password);
    user.password = hashedPassword;
    user.otp = undefined!;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  }

  // logout
  logOut = async (req: Request, res: Response, next: NextFunction) => {
    const { flag }: LogoutType = req.body;
    if (flag == FlagType.All) {
      req!.user!.changeCredentials = new Date();
      await req.user?.save();
      return res.status(200).json({ message: "User logged out from all devices successfully" });
    }
    await this._revokeTokenModel.create({ idToken: req!.decoded!.jti!, userId: req!.user!._id, expiresAt: new Date(req!.decoded!.exp! * 1000) });
    return res.status(200).json({ message: "User logged out from this device successfully" });
  }

  // refresh token
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const jwtid = uuid();
    const access_token = await generateToken({
      payload: { id: req!.user!._id!, role: req!.user!.role! },
      signature: req!.user!.role! == RoleType.User ? process.env.ACCESS_JWT_SECRET_USER! : process.env.ACCESS_JWT_SECRET_ADMIN!,
      options: { expiresIn: "1d", jwtid }
    });
    const refresh_token = await generateToken({
      payload: { id: req!.user!._id!, jwtid },
      signature: req!.user!.role! == RoleType.User ? process.env.REFRESH_JWT_SECRET_USER! : process.env.REFRESH_JWT_SECRET_ADMIN!,
      options: { expiresIn: "7d", jwtid }
    });
    await this._revokeTokenModel.create({ idToken: req!.decoded!.jti!, userId: req!.user!._id, expiresAt: new Date(req!.decoded!.exp! * 1000) });
    res.status(200).json({ message: "token refreshed successfully", access_token, refresh_token });
  }

  // get profile
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const phone = await Decrypt({ cipherText: req!.user!.phone, signature: process.env.SECRET_KEY! });
    req!.user!.phone = phone;
    return res.status(200).json({ user: req.user });
  }

  // update Password
  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword }: UpdatePassswordType = req.body;
    const isMatch = await Compare(oldPassword, req!.user!.password!);
    if (!isMatch) {
      throw new AppError("Invalid password", 400);
    }
    const hashedPassword = await Hash(newPassword);
    req!.user!.password = hashedPassword;
    await req.user?.save();
    return res.status(200).json({ message: "Password updated successfully" });
  }

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone, password, address, age, fullName, gender, image }: UpdateProfileType = req.body;
    if (phone) req!.user!.phone = await Encrypt({ plainText: phone, signature: process.env.SECRET_KEY! });
    if (password) req!.user!.password = await Hash(password);
    if (address) req!.user!.address = address;
    if (age) req!.user!.age = age;
    if (fullName) req!.user!.fullName = fullName;
    if (gender) req!.user!.gender = gender;
    if (image) req!.user!.image = image;
    if (email) {
      const isEmailExist = await this._userModel.findOne({ email });
      if (isEmailExist) {
        throw new AppError("Email already exist", 400);
      }
      req!.user!.email = email;
      req!.user!.confirmed = false;
      const otp = uuid().replaceAll(/\D/g, "").slice(0, 6);
      const hashedOtp = await Hash(otp);
      req!.user!.otp = hashedOtp;
      eventEmitter.emit("confirmEmail", { email, otp });
    }
    await req.user?.save();
    return res.status(200).json({ message: "Profile updated successfully" });
  }
}
export default new UserService();