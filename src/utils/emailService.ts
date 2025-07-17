import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port : 465, 
  secure : true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string) {

  console.log("Email user" ,process.env.EMAIL_USER )
  console.log("Email pass" ,process.env.EMAIL_PASS )
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EC4899;">Password Reset Request</h2>
        <p>Here's your OTP code:</p>
        <div style="background: #FDF2F8; padding: 20px; text-align: center; margin: 20px 0;">
          <h3 style="color: #EC4899; font-size: 24px; margin: 0;">${otp}</h3>
        </div>  
        <p>This code will expire in 5 minutes.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}