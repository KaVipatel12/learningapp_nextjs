import { connect } from "@/db/dbConfig";
import { Course, Report } from "@/models/models";
import { NextResponse } from "next/server";

export async function GET() {
  await connect();

  try {
    // Fetch all reports
    const reports = await Report.find({}) 
    .populate({
    path: 'userId',          
    select: 'username'     
  })
  .populate({
    path: 'courseId',          
    select: 'title'     
  })
   .populate({
    path: 'commentId',
    select: 'comment userId',
    populate: {
      path: 'userId',
      select: 'username'
    }
  });

    // Separate into commentReports and courseReports
    const commentReports = reports.filter((r) => r.commentId !== null);
    const courseReports = reports.filter((r) => r.commentId === null);

    // Fetch restricted courses
    const restrictedCourses = await Course.find(
      { status: "restricted" },
      "title description educatorName date"
    );

    return NextResponse.json(
      {
        commentReports,
        courseReports,
        restrictedCourses
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
