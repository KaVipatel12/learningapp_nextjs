// app/api/quiz/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Course, Notification } from '@/models/models';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { connect } from '@/db/dbConfig';

    export async function PATCH(req: NextRequest) {
      try {
        await connect();
        
        const authResult = await authUserMiddleware(req);
        
        if (authResult instanceof NextResponse) {
          return authResult;
        }
        
        const { user }  = authResult as AuthContext;
        const userId : string | undefined = user?._id
        if (!user) {
          return NextResponse.json(
            { msg: "Authentication failed" },
            { status: 401 }
          );
        }

        if(user.role !== "admin"){
            return NextResponse.json(
            { 
                message: "only admin can perform this action" 
            },
            { status: 401 }
            );
        }
        
    const { status , courseId } = await req.json()
    const updateStatus = await Course.findByIdAndUpdate(courseId , { status : status } , {new : true})

    const message = status === "restricted" ? `Your course ${updateStatus.title} has been ${status}, Please follow the guidlines to avoid the account restrictions, You can republish your course by following guidelines` : status === "approved" ? `Congratulations!, Your course has been ${status}` : `Sorry, Your course ${updateStatus.title} has been ${status}, This is due to violaton of guidelines, You can republish your course by following guidelines `; 

    await Notification.create({userId , courseId , message}); 

    if(!updateStatus){
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