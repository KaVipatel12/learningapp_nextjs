// app/api/quiz/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {  Report } from '@/models/models';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { connect } from '@/db/dbConfig';

    export async function POST(req: NextRequest) {
      try {
        await connect();
        
        const authResult = await authUserMiddleware(req);
        
        if (authResult instanceof NextResponse) {
          return authResult;
        }
        
        const { user } = authResult as AuthContext;

    const { userId , courseId , chapterId , commentId , description } = await req.json()

    const reporterId = user?._id

      const checkReportAvailable = await Report.findOne({
      userId,
      courseId,
      chapterId: chapterId ?? null,
      commentId: commentId ?? null,
    });

      if(checkReportAvailable){
        return NextResponse.json(
           { 
               message: "You have already reported this"
           },
           { status: 400 }
           );
      }
      
    const submitReport = await Report.create({ reporterId , userId , courseId , chapterId , commentId , description}); 

    console.log(submitReport)

    if(!submitReport){
         return NextResponse.json(
            { 
                message: "something went wrong" 
            },
            { status: 400 }
            );
    }

    return NextResponse.json(
      { 
        message: 'Response updated successfully', 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in updating:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}