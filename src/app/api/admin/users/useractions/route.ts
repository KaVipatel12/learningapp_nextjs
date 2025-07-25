// app/api/quiz/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/models';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { connect } from '@/db/dbConfig';

    export async function PATCH(req: NextRequest) {
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

        if(user.role !== "admin"){
            return NextResponse.json(
            { 
                message: "Only admin can perform this action" 
            },
            { status: 401 }
            );
        }
        
    const { userId , status  } = await req.json()

    const updateStatus = await User.findByIdAndUpdate(userId , { restriction : status }, {new : true}); 

    console.log(updateStatus)
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
        message: 'User status updated successfully', 
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