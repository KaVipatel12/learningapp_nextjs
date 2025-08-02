// app/api/quiz/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserQuizAttempt } from '@/models/models';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { connect } from '@/db/dbConfig';

    export async function GET(req: NextRequest) {
      try {
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
        
        // Now we can use the user data to fetch more information
          const userId = user._id;
    
    const attempts = await UserQuizAttempt.find({ userId })
      .populate('courseId', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json(
      { 
        message: 'Quiz history fetched successfully',
        attempts 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}