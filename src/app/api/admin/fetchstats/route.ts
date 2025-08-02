import { connect } from "@/db/dbConfig";
import { Course, Report, User } from "@/models/models";
import { NextResponse } from "next/server";

export async function GET() {
  await connect();

  try {
   
    // Count total users 

    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments(); 
    const totalReports = await Report.countDocuments();  

    return NextResponse.json(
      {
        totalUsers,
        totalCourses,
        totalReports
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports/courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
