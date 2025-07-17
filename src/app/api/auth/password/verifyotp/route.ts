import { connect } from "@/db/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";

const OTP = mongoose.models.OTP || mongoose.model('OTP', new mongoose.Schema({
  email: String,
  code: String,
  expiresAt: Date,
  attempts: Number
}, { timestamps: true }));

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { email, otp } = await req.json();

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { msg: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { msg: "OTP expired or invalid" },
        { status: 404 }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { msg: "Too many attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      );
      return NextResponse.json(
        { msg: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { msg: "OTP has expired" },
        { status: 400 }
      );
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Update user with reset token (example for User model)
    const user = await mongoose.model('User').findOneAndUpdate(
      { email },
      { resetToken, resetTokenExpiry },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { msg: "User not found" },
        { status: 404 }
      );
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      msg: "OTP verified successfully",
      resetToken
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}