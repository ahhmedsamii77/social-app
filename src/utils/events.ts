import { EventEmitter } from "node:events";
import { v4 as uuid } from "uuid";
import { sendEmail } from "../service/sendEmail";
import { emailTemplate } from "../service/email.template";
import { AppError } from "./classError";
export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  const { email } = data;
  const otp = uuid().replaceAll(/\D/g, "").slice(0, 6);
  const isSend = await sendEmail({ to: email, subject: "Social App", html: emailTemplate({otp}) });
  if (!isSend) {
     throw new AppError("failed to send email", 500);
  }
});