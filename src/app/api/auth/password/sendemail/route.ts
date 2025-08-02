import { connect } from "@/db/dbConfig";
import { User } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendOTPEmail } from "@/utils/emailService";

// Create OTP model schema if not exists
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Auto-delete expired OTPs after 5 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { msg: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (!userExists) {
      return NextResponse.json(
        { msg: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const digits = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += digits[crypto.randomInt(0, 36)];
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    console.log(otp)
    // Remove any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({ email, code: otp, expiresAt });

    // In production, you would send the OTP via email here
    console.log(`OTP for ${email}: ${otp}`);
    
    await sendOTPEmail(email, otp);
    return NextResponse.json(
      { 
        msg: "OTP sent successfully",
        // Don't send OTP in production!
        otp: process.env.NODE_ENV === 'development' ? otp : null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("OTP generation error:", error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}