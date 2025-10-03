import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
export async function sendEmail(mailOptions: Mail.Options) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    ...mailOptions
  });
  if (info.accepted.length == 0) {
    return false;
  }
  return true;
}