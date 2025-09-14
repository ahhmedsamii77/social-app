import { EventEmitter } from "node:events"
import { sendEmail } from "../../service/sendEmail";
import { emailTemplate } from "../../service/emai.template";
import { AppError } from "../classError";

export const eventEmitter = new EventEmitter()


eventEmitter.on("confirmEmail", async (data) => {
  const { email, otp } = data;
  const isSend = await sendEmail({ to: email, subject: "Confirm your account", html: emailTemplate(otp, "Confirm your account") });
  if (!isSend) {
    throw new AppError("Failed to send email", 500);
  }
});


eventEmitter.on("forgetPassword", async (data) => {
  const { email, otp } = data;
  const isSend = await sendEmail({ to: email, subject: "Forget password", html: emailTemplate(otp, "Forget password") });
  if (!isSend) {
    throw new AppError("Failed to send email", 500);
  }
});