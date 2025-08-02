import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/db/dbConfig';
import { UserQuizAttempt } from '@/models/models';
import { AuthContext, authUserMiddleware } from "@/app/middleware/authUserMiddleware";


export async function GET(
  req: NextRequest,
  props : { params: Promise<{ quizId : string , courseId : string}> }
) {

        await connect();
          
        const authResult = await authUserMiddleware(req);
        
    
        if (authResult instanceof NextResponse) {
          return authResult;
        }
        
        const { user } = authResult as AuthContext;
        
        if (!user) {
          return NextResponse.json(
            { msg: "Authentication failed" },
            { status: 401 }
          );
        }

        const { quizId , courseId } = await props.params;
        const userId = user._id; 
   try {
    const fetchScore = await UserQuizAttempt.findOne({ userId , quizId , courseId });

    return NextResponse.json(
      { message: "Quiz fetched successfully", fetchScore},
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
