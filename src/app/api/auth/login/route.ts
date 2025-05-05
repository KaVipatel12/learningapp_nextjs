import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import Educator from "@/models/educatorModel";  // assuming you have this model
import { connect } from "@/db/dbConfig";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connect();

    const { email, password } =  await req.json();

    // Check for required fields
    if (!email || !password) {
      return NextResponse.json(
        { msg: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const studentExist = await User.findOne({ email });

    // Check if Educator exists (if student does not exist)
    const EducatorExist = !studentExist ? await Educator.findOne({ email }) : null;

    if (!studentExist && !EducatorExist) {
      return NextResponse.json({ msg: "Invalid Email" }, { status: 400 });
    }

    let isPasswordValid: boolean;
    let userData; 

    if (studentExist) {
      isPasswordValid = await bcrypt.compare(password, studentExist.password);
      userData = studentExist;
    } else if (EducatorExist) {
      isPasswordValid = await bcrypt.compare(password, EducatorExist.password);
      userData = EducatorExist;
    }

    if (!isPasswordValid!) {
      return NextResponse.json({ msg: "Invalid Credentials" }, { status: 401 });
    }

    // Ensure JWT_SECRET is present
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET not set in environment variables");
      return NextResponse.json(
        { msg: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userData._id.toString(), email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Create response and attach cookie
    const response = NextResponse.json(
      {
        msg: "Login Successful",
        token,
        success : true, 
        userId: userData._id.toString(),
        role: userData.role,
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;

  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}
