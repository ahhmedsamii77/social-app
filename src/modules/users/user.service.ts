import { HydratedDocument, Model } from "mongoose";
import { AppError, encrypt, eventEmitter, Hash, SignupType, } from "../../utils/index";
import { userModel } from "../../DB/models/user.model";
import { NextFunction, Request, Response } from "express";
import { UserRepsotiry } from "../../DB/repositories/user.repsotiry";

class UserService {
  private _userModel = new UserRepsotiry(userModel);
  constructor() { }
  sigUp = async (req: Request, res: Response, next: NextFunction) => {
    const { userName, email, password, age, address, phone, gender }: SignupType = req.body;
    const isUserExist = await this._userModel.findOne({ email });
    if (isUserExist) {
      throw new AppError("user already exist", 409);
    }
    const hashPassword = await Hash(password);
    const encryptedPhone = await encrypt({ plaintext: phone, key: process.env.ENCRYPTION_KEY as string });
    eventEmitter.emit("confirmEmail", { email });
    const user = await this._userModel.createOneUser({ userName, email, password: hashPassword, age, address, phone: encryptedPhone, gender });
    return res.status(201).json({ message: "user created successfully", user });
  }
}

export default new UserService();