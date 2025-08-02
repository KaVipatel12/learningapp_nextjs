import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db/dbConfig';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { User } from '@/models/models';

export async function POST(req: NextRequest) {
  await connect();
  
  try {
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

    const { teachingFocus } = await req.json();
    
    if (!Array.isArray(teachingFocus) || teachingFocus.some(item => typeof item !== 'string')) {
      throw new Error('Invalid teaching focus format');
    }
    
    if(user.role === "student"){
      return NextResponse.json( { msg: "Authentication failed" },
            { status: 401 })
    }
    const save = await User.findByIdAndUpdate(
       user._id,{
      $set : { 
        teachingFocus 
       }}, 
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      msg: 'Teaching focus saved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : 'Failed to save teaching focus' },
      { status: 500 }
    );
  }
}


export async function GET(req : NextRequest) {
  await connect();
  
    try {  

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
  
    return NextResponse.json({
      success: true,
      teachingFocus: user?.teachingFocus || []
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch teaching focus' },
      { status: 500 }
    );
  }
}