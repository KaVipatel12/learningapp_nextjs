import { connect } from "@/db/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { sendOTPEmail } from "@/utils/emailService";
import crypto from "crypto";
import mongoose from "mongoose";

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

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update OTP in database
    await mongoose.model('OTP').findOneAndUpdate(
      { email },
      { code: otp, expiresAt, attempts: 0 },
      { upsert: true, new: true }
    );

    // Resend email (using the same function as sendemail)
    await sendOTPEmail(email, otp);

    return NextResponse.json(
      { success: true, msg: "New OTP sent successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { msg: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}