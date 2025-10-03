import { EventEmitter } from "node:events";
import { sendEmail } from "../../service/sendEmail";
import { emailTemplate } from "../../service/email.template";
import { AppError } from "../classError";
import { deleteFile, getFile } from "../aws";
import { UserRepository } from "../../DB/repositories/user.repository";
import { userModel } from "../../DB/models/user.model";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  const { email, otp } = data;
  const isSend = await sendEmail({
    to: email,
    subject: "Confirm Email",
    html: emailTemplate({ subject: "Confirm Email", otp })
  });
  if (!isSend) {
    throw new AppError("failed to send email", 500);
  }
})


eventEmitter.on("forgetPassword", async (data) => {
  const { email, otp } = data;
  const isSend = await sendEmail({
    to: email,
    subject: "Forget Password",
    html: emailTemplate({ subject: "Forget Password", otp })
  });
  if (!isSend) {
    throw new AppError("failed to send email", 500);
  }
})



eventEmitter.on("uploadImage", async (data) => {
  const { userId, Key, oldKey, expireIn } = data;
  const _userModel = new UserRepository(userModel);
  setTimeout(async () => {
    try {
      await getFile({ Key });
      await _userModel.findOneAndUpdate({ _id: userId }, { $unset: { tempProfileImage: "" } });
      if (oldKey) {
        await deleteFile({ Key: oldKey });
      }
    } catch (error: any) {
      if (error.Code = "NoSuchKey") {
        if (!oldKey) {
          await _userModel.findOneAndUpdate({ _id: userId }, { $unset: { profileImage: "", tempProfileImage: "" } });
        } else {
          await _userModel.findOneAndUpdate({ _id: userId }, { $set: { profileImage: oldKey, }, $unset: { tempProfileImage: "" } });
        }
      }
    }
  }, expireIn * 1000);
})
