import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/db/dbConfig';
import { UserQuizAttempt } from '@/models/models';
import { CourseAccessContext, courseAccessMiddleware } from "@/app/middleware/courseAccessMiddleware";


export async function POST(
  req: NextRequest
) {

  await connect();
  
    const {quizId , courseId, score, total } = await req.json();
    const accessCourse = await courseAccessMiddleware(req, courseId);
  
    if (accessCourse instanceof NextResponse) {
        return accessCourse;
    }
    
    const {user , courseModify , courseAccess } = accessCourse as CourseAccessContext;
    
    const userId = user._id.toString()
    console.log(quizId , courseId, score, total, userId)

   try {
    const saveUser = await UserQuizAttempt.findOneAndUpdate({
        userId,
        courseId,
        quizId
      },
      {
        score,
        total,
      },
      { upsert: true, new: true }
    );

    console.log(saveUser)
    return NextResponse.json(
      { message: "Quiz fetched successfully", quiz: saveUser , courseModify , courseAccess},
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
