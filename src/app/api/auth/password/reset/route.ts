import { connect } from "@/db/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models/models";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { email, newPassword, confirmPassword } = await req.json();
    
    // Validate inputs
    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { msg: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { msg: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { msg: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await User.findOne({ 
      email}
    );

    if (!user) {
      return NextResponse.json(
        { msg: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    await User.updateOne(
      { _id: user._id },
      { 
        password: hashedPassword,
        resetToken: undefined,
        resetTokenExpiry: undefined
      }
    );

    return NextResponse.json({
      success: true,
      msg: "Password reset successfully"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}