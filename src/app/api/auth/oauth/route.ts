import { connect } from "@/db/dbConfig";
import { User } from "@/models/models";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

// Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ msg: "No credential provided" }, { status: 400 });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ msg: "Invalid Google token" }, { status: 400 });
    }

    const email = payload.email;
    const name = payload.name || "No Name";
    const image = payload.picture;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Register user if doesn't exist
      user = await User.create({
        email,
        username: name.replace(/\s+/g, "_").toLowerCase(),
        role: "student", // or "educator" — you can make this dynamic from frontend
        profilePic: image,
        password: null, // since OAuth
        isOAuth: true,
      });
    }

    // JWT creation
    const JWT_SECRET = process.env.JWT_SECRET!;
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Set JWT in cookie
    const response = NextResponse.json({
      msg: user ? "Login Successful" : "Registration Successful",
      success: true,
      userId: user._id.toString(),
      token,
      registration : user ? false : true
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
