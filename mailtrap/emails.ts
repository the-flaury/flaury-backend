import { resolveSync } from "bun";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates";
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
