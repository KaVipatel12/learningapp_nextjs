import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/db/dbConfig';
import { CourseQuiz } from '@/models/models';
import { CourseAccessContext, courseAccessMiddleware } from "@/app/middleware/courseAccessMiddleware";


export async function GET(
  req: NextRequest,
  props: { params: Promise<{ quizId: string , courseId : string}> }
) {
  await connect();

  const { quizId , courseId } = await props.params;

    const accessCourse = await courseAccessMiddleware(req, courseId);
  
      if (accessCourse instanceof NextResponse) {
        return accessCourse;
      }
  
    const {courseModify , courseAccess } = accessCourse as CourseAccessContext;

  try {

    const quize = await CourseQuiz.findById(quizId);

    return NextResponse.json(
      { message: "Quiz fetched successfully", quiz: quize , courseModify , courseAccess },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
