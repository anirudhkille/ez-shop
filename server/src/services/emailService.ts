import { resend } from "@/config/mail";
import { env } from "@/config/env.config";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error("Email sending failed");
    }

    return data;
  } catch (err) {
    console.error("Email Service Error:", err);
    throw err;
  }
};
