export const resetPasswordTemplate = (name: string, resetUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center;">
        <img src="https://ez-shop.onrender.com/favicon.ico" alt="EZ Shop Logo" style="max-width: 120px; margin-bottom: 20px;">
      </div>

      <h2 style="color: #333333; text-align: center; margin-top: 0;">
        Reset your EZ Shop password
      </h2>

      <p style="color: #555555; font-size: 16px;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color: #555555; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password for your
        <strong>EZ Shop</strong> account.
      </p>

      <p style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Reset password
        </a>
      </p>

      <p style="color: #555555; font-size: 14px; line-height: 1.6;">
        This link is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.
      </p>

      <p style="color: #555555; font-size: 16px; line-height: 1.6;">
        Thank you,<br>
        <strong>Anirudh Kille</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

      <p style="font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
        &copy; 2026 EZ Shop. All rights reserved.<br>
        Developed by
        <a href="https://www.anirudhkille.com" style="text-decoration:none;color: #555555;">
          <strong>Anirudh Kille</strong>
        </a>
      </p>
    </div>
  `;
};
