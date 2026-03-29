import { resend } from "@/config/mail";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to,
      subject,
      html,
    });
    console.log(to)
    console.log(process.env.EMAIL_FROM)

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