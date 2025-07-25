import { connect } from "@/db/dbConfig";
import { Course } from "@/models/models";
import { NextResponse } from "next/server";
import mongoose from "mongoose";


interface CourseType {
  _id: mongoose.Types.ObjectId;
  title: string;
  educatorName: string;
  category: string;
  price: number;
  totalEnrollment: number;
  __v?: number;
}

export async function GET() {
  await connect();

  try {

    const courses = (await Course.find({ status : "pending"} ,  "title description educatorName date")) as CourseType[];

    return NextResponse.json(
      {
        courses
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
