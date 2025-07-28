import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db/dbConfig";
import { Notification, User }  from "@/models/models";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { username, email, password, mobile, role } = await req.json();

    // Validate all required fields
    if (!username || !email || !password || !mobile || !role) {
      return NextResponse.json(
        { success: false, msg: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== "student" && role !== "educator") {
      return NextResponse.json(
        { success: false, msg: "Invalid role provided" },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const studentExist = await User.findOne({ email });

    if (studentExist) {
      return NextResponse.json(
        { success: false, msg: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const userData = { username, email, password: hashedPassword, mobile , role : role };
    const newUser = await User.create(userData)

    if (!newUser) {
      return NextResponse.json(
        { success: false, msg: "User registration failed" },
        { status: 500 }
      );
    }

    // Create token
    const token = jwt.sign(
      { id: newUser._id, email},
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    // sending a notification message. 
    const userId = newUser._id
    const message = role === "educator" ? `Welcome aboard, Educator! 🎉
        Your account has been successfully created.
        You're now ready to share knowledge and inspire learners! 📚
        👉 Don’t forget to follow our community guidelines to ensure a safe and respectful learning environment. ✅` :`Welcome to the learning hub! 🚀
        Your account is all set up.
        Start exploring courses, learn new skills, and track your progress! 🌟
        📌 Make sure to follow the student guidelines for a great experience. ✅`

    await Notification.create({ userId , message})

    // Set cookie
    const response = NextResponse.json(
      { 
        success: true, 
        msg: "Registration successful",
        token,
        userId: newUser._id,
        role
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}