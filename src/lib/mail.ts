import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials are not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendOtpEmail(to: string, otp: string) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"BrandBridge AI" <${GMAIL_USER}>`,
    to,
    subject: "Verify your BrandBridge AI account",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #8b5cf6; margin-bottom: 8px;">BrandBridge AI</h2>
        <p style="color: #333; margin-bottom: 24px;">Your verification code is:</p>
        <div style="background: #f4f4f8; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0a0a12;">
          ${otp}
        </div>
        <p style="color: #666; margin-top: 24px; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(
  to: string,
  resetUrl: string,
) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"BrandBridge AI" <${GMAIL_USER}>`,
    to,
    subject: "Reset your BrandBridge AI password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #8b5cf6; margin-bottom: 8px;">BrandBridge AI</h2>
        <p style="color: #333; margin-bottom: 24px;">Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #4f8cff); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #666; margin-top: 24px; font-size: 14px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
