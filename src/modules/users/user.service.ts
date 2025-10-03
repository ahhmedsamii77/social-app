import { NextFunction, Request, Response } from "express";
import { userModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { AppError, Compare, ConfirmEmailType, Decrypt, Encrypt, eventEmitter, FlagType, ForgetPasswordType, generateOtp, generateToken, Hash, LogoutType, ProviderType, ResetPasswordType, RoleType, SigninType, SignupType, UpdatePasswordType, UpdateProfileType } from "../../utils";
import { v4 as uuid } from "uuid"
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { RevokeTokenRepository } from "../../DB/repositories/revokeToken.repository";
import { revokeTokenModel } from "../../DB/models/revokeToken.model";
import { Types } from "mongoose";
import { putPresignedFile, uplaodFile, uploadFiles, uploadLargeFile } from "../../utils/aws";

class UserService {
  private _userModel = new UserRepository(userModel);
  private _revokeTokenModel = new RevokeTokenRepository(revokeTokenModel);

  constructor() { }

  //signup
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, password, email, age, phone, address, gender }: SignupType = req.body;
    const isUserExist = await this._userModel.findOne({ email });
    if (isUserExist) throw new AppError("user already exist", 409);
    const hashedPassword = await Hash({ plainText: password });
    const encryptedPhone = await Encrypt({ plainText: phone, secretKey: process.env.PHONE_SECRET_KEY! });
    const otp = await generateOtp();
    const hashedOtp = await Hash({ plainText: otp });
    eventEmitter.emit("confirmEmail", { email, otp });
    const user = await this._userModel.create({ fullName, password: hashedPassword!, email, age, phone: encryptedPhone!, address: address!, otp: hashedOtp!, gender: gender! });
    return res.status(201).json({ message: "user created successfully.please confirm your account", user });
  }

  // confirm email
  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp }: ConfirmEmailType = req.body;
    const user = await this._userModel.findOne({ email, confirmed: false });
    if (!user) throw new AppError("user not found or already confirmed", 404);
    const isMatch = await Compare({ plainText: otp!, cipherText: user.otp! });
    if (!isMatch) throw new AppError("invalid otp", 400);
    user.confirmed = true;
    user.otp = undefined!;
    await user.save();
    return res.status(200).json({ message: "email confirmed successfully.now you can login" });
  }

  // signIn
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: SigninType = req.body;
    const user = await this._userModel.findOne({ email, confirmed: true });
    if (!user) throw new AppError("user not found or not confirmed", 404);
    const isMatch = await Compare({ plainText: password, cipherText: user.password! });
    if (!isMatch) throw new AppError("invalid password", 400);
    const jwtid = uuid();
    const access_token = await generateToken({
      payload: { id: user._id, role: user.role },
      signature: user.role == RoleType.USER ? process.env.ACCESS_USER_SECRET_KEY! : process.env.ACCESS_ADMIN_SECRET_KEY!,
      options: { expiresIn: "1d", jwtid }
    });
    const refresh_token = await generateToken({
      payload: { id: user._id, role: user.role },
      signature: user.role == RoleType.USER ? process.env.REFRESH_USER_SECRET_KEY! : process.env.REFRESH_ADMIN_SECRET_KEY!,
      options: { expiresIn: "7d", jwtid }
    });
    return res.status(200).json({ message: "user logged in successfully", access_token, refresh_token });
  }

  // login with gmail
  loginWithGmail = async (req: Request, res: Response, next: NextFunction) => {
    const { idToken } = req.body;
    const client = new OAuth2Client();
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID!,
      });
      const payload = ticket.getPayload();
      return payload;
    }
    const { email, email_verified, name, picture } = await verify() as TokenPayload;
    let user = await this._userModel.findOne({ email });
    if (!user) {
      user = await this._userModel.create({
        fullName: name!,
        email: email!,
        profileImage: picture!,
        confirmed: email_verified!,
        provider: ProviderType.GOOGLE!
      });
    }
    if (user.provider != ProviderType.GOOGLE) throw new AppError("please login with system", 409);
    const jwtid = uuid();
    const access_token = await generateToken({
      payload: { id: user._id, role: user.role },
      signature: user.role == RoleType.USER ? process.env.ACCESS_USER_SECRET_KEY! : process.env.ACCESS_ADMIN_SECRET_KEY!,
      options: { expiresIn: "1d", jwtid }
    });
    const refresh_token = await generateToken({
      payload: { id: user._id, role: user.role },
      signature: user.role == RoleType.USER ? process.env.REFRESH_USER_SECRET_KEY! : process.env.REFRESH_ADMIN_SECRET_KEY!,
      options: { expiresIn: "7d", jwtid }
    });
    return res.status(200).json({ message: "user logged in successfully", access_token, refresh_token });
  }

  // logout
  logOut = async (req: Request, res: Response, next: NextFunction) => {
    const { flag }: LogoutType = req.body;
    if (flag == FlagType.All) {
      req!.user!.changeCredentials = new Date();
      await req!.user!.save();
      return res.status(200).json({ message: "user logged out from all devices successfully" });
    }
    this._revokeTokenModel.create({ userId: req!.user!._id, idToken: req.decoded?.jti!, expireIn: new Date(req.decoded?.exp! * 1000) });
    return res.status(200).json({ message: "user logged out from this device successfully" });
  }

  // refreshToken
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const jwtid = uuid();
    const access_token = await generateToken({
      payload: { id: req?.user?._id, role: req?.user?.role },
      signature: req?.user?.role == RoleType.USER ? process.env.ACCESS_USER_SECRET_KEY! : process.env.ACCESS_ADMIN_SECRET_KEY!,
      options: { expiresIn: "1d", jwtid }
    });
    const refresh_token = await generateToken({
      payload: { id: req?.user?._id, role: req?.user?.role },
      signature: req?.user?.role == RoleType.USER ? process.env.REFRESH_USER_SECRET_KEY! : process.env.REFRESH_ADMIN_SECRET_KEY!,
      options: { expiresIn: "7d", jwtid }
    });
    await this._revokeTokenModel.create({ userId: req!.user!._id, idToken: req.decoded?.jti!, expireIn: new Date(req.decoded?.exp! * 1000) });
    return res.status(200).json({ message: "token refreshed successfully", access_token, refresh_token });
  }

  // get user data
  getUserData = async (req: Request, res: Response, next: NextFunction) => {
    const phone = await Decrypt({ cipherText: req.user?.phone!, secretKey: process.env.PHONE_SECRET_KEY! });
    req!.user!.phone = phone;
    return res.status(200).json({ message: "user profile fetched successfully", user: req.user });
  }

  // get profile
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params as unknown as { userId: Types.ObjectId };
    const user = await this._userModel.findById(userId);
    if (!user) throw new AppError("user not found", 404);
    return res.status(200).json({ message: "user profile fetched successfully", user });
  }

  // update password
  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword }: UpdatePasswordType = req.body;
    const isMatch = await Compare({ plainText: oldPassword, cipherText: req.user?.password! });
    if (!isMatch) throw new AppError("old password is incorrect", 400);
    const hashedPassword = await Hash({ plainText: newPassword });
    req.user!.password = hashedPassword;
    await req.user!.save();
    return res.status(200).json({ message: "password updated successfully" });
  }

  // forget password
  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: ForgetPasswordType = req.body;
    const user = await this._userModel.findOne({ email, confirmed: true });
    if (!user) throw new AppError("user not found", 404);
    const otp = await generateOtp();
    const hashedOtp = await Hash({ plainText: otp });
    eventEmitter.emit("forgetPassword", { email, otp });
    user.otp = hashedOtp;
    await user.save();
    return res.status(200).json({ message: "otp sent successfully" });
  }

  // reset password
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, otp }: ResetPasswordType = req.body;
    const user = await this._userModel.findOne({ email });
    if (!user) throw new AppError("user not found", 404);
    const isMatch = await Compare({ plainText: otp, cipherText: user.otp! });
    if (!isMatch) throw new AppError("invalid otp", 400);
    const hashedPassword = await Hash({ plainText: password });
    user.password = hashedPassword;
    user.otp = undefined!;
    await user.save();
    const jwtid = uuid();
    const access_token = await generateToken({
      payload: { id: req?.user?._id, role: req?.user?.role },
      signature: req?.user?.role == RoleType.USER ? process.env.ACCESS_USER_SECRET_KEY! : process.env.ACCESS_ADMIN_SECRET_KEY!,
      options: { expiresIn: "1d", jwtid }
    });
    const refresh_token = await generateToken({
      payload: { id: req?.user?._id, role: req?.user?.role },
      signature: req?.user?.role == RoleType.USER ? process.env.REFRESH_USER_SECRET_KEY! : process.env.REFRESH_ADMIN_SECRET_KEY!,
      options: { expiresIn: "7d", jwtid }
    });
    return res.status(200).json({ message: "password reset successfully", access_token, refresh_token });
  }

  // update profile
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, age, phone, address, gender, email }: UpdateProfileType = req.body;
    if (fullName) req.user!.fullName = fullName;
    if (age) req.user!.age = age;
    if (phone) req.user!.phone = await Encrypt({ plainText: phone, secretKey: process.env.PHONE_SECRET_KEY! });
    if (address) req.user!.address = address;
    if (gender) req.user!.gender = gender;
    if (email) {
      const isEmailExist = await this._userModel.findOne({ email });
      if (isEmailExist) throw new AppError("email already exist", 409);
      req.user!.email = email;
      req.user!.confirmed = false;
      const otp = await generateOtp();
      const hashedOtp = await Hash({ plainText: otp });
      req.user!.otp = hashedOtp;
      eventEmitter.emit("confirmEmail", { email, otp });
    }
    await req.user!.save();
    return res.status(200).json({ message: "profile updated successfully", user: req.user });
  }

  // uplaod image
  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    const { originalname, ContentType } = req.body;
    const { url, Key } = await putPresignedFile({
      originalname,
      ContentType
    });
    console.log(url, Key)
    const user = await this._userModel.findOneAndUpdate({ _id: req.user?._id }, {
      profileImage: Key,
      tempProfileImage: req!.user!.profileImage
    });
    eventEmitter.emit("uploadImage", { Key, oldKey: req.user?.profileImage, userId: req.user?._id, expireIn: 60 });
    return res.status(200).json({ message: "image uploaded successfully", user, url });
  }

  // freeze account
  freezeAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (userId && req?.user?.role != RoleType.ADMIN) throw new AppError("unauthorized", 401);
    const user = await this._userModel.findOneAndUpdate({ _id: userId || req.user?._id, deletedAt: { $exists: false } }, {
      deletedAt: new Date(),
      deletedBy: req.user?._id,
    });
    if (!user) throw new AppError("user not found", 404);
    return res.status(200).json({ message: "account frozen successfully", user });
  }

  // unfreeze account
  unfreezeAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (req.user?._id.toString() === userId) {
      throw new AppError("Admin cannot unfreeze their own account, another admin must do it", 403);
    }
    const user = await this._userModel.findOneAndUpdate({ _id: userId, deletedAt: { $exists: true } }, {
      reStoredAt: new Date(),
      reStoredBy: req.user?._id,
      $unset: { deletedAt: "", deletedBy: "" }
    });
    if (!user) throw new AppError("user not found", 404);
    return res.status(200).json({ message: "account unfrozen successfully"});
  }
}
export default new UserService();