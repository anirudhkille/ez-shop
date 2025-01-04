export const resetPasswordTemplate = (name, resetUrl) => {
  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="https://ez-shop.onrender.com/favicon.ico" alt="EZ Shop Logo" style="max-width: 150px; margin-bottom: 20px;">
        </div>
        <h2 style="color: #333333; text-align: center; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #555555; font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
          We received a request to reset your password for your <strong>EZ Shop</strong> account. Click the button below to proceed with resetting your password:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
            Reset Password
          </a>
        </div>
        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
          If you did not request this password reset, you can safely ignore this email. Your account will remain secure.
        </p>
        <p style="color: #555555; font-size: 16px; line-height: 1.5;">Thank you,<br><strong>Anirudh Kille</strong></p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
          &copy; 2024 EZ Shop. All rights reserved. | By <a href="https://www.anirudhkille.com" style="text-decoration:none;color: #555555;"><strong>Anirudh Kille</strong></a><br>
        </p>
      </div>
    `;
};
