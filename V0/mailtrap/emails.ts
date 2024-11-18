import { resolveSync } from "bun";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates";
import { sender } from "./mailtrap.config";
import { sendEmail } from "./sendEmail";

export async function sendVerificationEmail(email: string, token: number) {
  const receipients = [{ email }];

  try {
    const response = await sendEmail({
      receipients,
      sender,
      subject: "Email Verification",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        token.toLocaleString()
      ),
      category: "Email Verification",
    });

    console.log("Email verification sent", response);
  } catch (error: any) {
    console.error("Error sending verification code ", error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
}

export async function sendPasswordResetCode(email: string, token: string) {
  const receipients = [{ email }];
  const resetUrl = `/reset-password/${token}`;

  try {
    const response = await sendEmail({
      receipients,
      sender,
      subject: "Password Reset",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetUrl", token),
    });
  } catch (error: any) {
    throw new Error("Error sending password reset link: ", error.message);
  }
}

export async function sendPasswordResetSuccessEmail(email: string) {
  const receipients = [{ email }];

  const response = await sendEmail({
    receipients,
    sender,
    subject: "Password Reset Successfully",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  });
}
