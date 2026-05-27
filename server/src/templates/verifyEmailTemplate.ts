export const verifyEmailTemplate = (email: string, otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 10px;">
    
    <div style="text-align: center;">
      <img src="https://ez-shop.onrender.com/favicon.ico" 
           alt="EZ Shop Logo" 
           style="max-width: 120px; margin-bottom: 20px;">
    </div>

    <h2 style="color: #333333; text-align: center; margin-top: 0;">
      Verify Your Email Address
    </h2>

    <p style="color: #555555; font-size: 16px;">
      Hi <strong>${email}</strong>,
    </p>

    <p style="color: #555555; font-size: 16px; line-height: 1.6;">
      Thank you for signing up for <strong>EZ Shop</strong>  
      Please use the verification code below to complete your registration.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="
        display: inline-block;
        padding: 15px 30px;
        font-size: 28px;
        letter-spacing: 6px;
        font-weight: bold;
        background-color: #000000;
        color: #ffffff;
        border-radius: 8px;">
        ${otp}
      </span>
    </div>

    <p style="color: #555555; font-size: 15px; line-height: 1.6; text-align: center;">
      This verification code will expire in <strong>10 minutes</strong>.
    </p>

    <p style="color: #555555; font-size: 15px; line-height: 1.6;">
      If you did not create an account with us, you can safely ignore this email.
    </p>

    <p style="color: #555555; font-size: 16px; line-height: 1.6;">
      Welcome aboard! <br>
      <strong>Anirudh Kille</strong>
    </p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

    <p style="font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
      &copy; 2026 EZ Shop. All rights reserved. <br>
      By <a href="https://www.anirudhkille.com" 
            style="text-decoration:none;color:#555555;">
            <strong>Anirudh Kille</strong>
          </a>
    </p>

  </div>
`;