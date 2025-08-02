// app/api/quiz/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Notification } from '@/models/models';
import { connect } from '@/db/dbConfig';

    export async function POST(req: NextRequest) {
try {

    await connect();    
    const { userId , commentId = null , chapterId = null , courseId = null } = await req.json()

    if(!userId){
        return NextResponse.json({msg : "Please provide the userId"})
    }
    const sendNotification = await Notification.create({userId , commentId , chapterId , courseId}); 

    if(!sendNotification){
         return NextResponse.json(
            { 
                message: "something went wrong" 
            },
            { status: 400 }
            );
    }

    return NextResponse.json(
      { 
        message: 'Warning sent successfully', 
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