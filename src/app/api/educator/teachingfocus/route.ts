import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db/dbConfig';
import { AuthContext, authEducatorMiddleware } from '@/app/middleware/authEducatorMiddleware';
import { Educator } from '@/models/models';

export async function POST(req: NextRequest) {
  await connect();
  
  try {
        const authResult = await authEducatorMiddleware(req);
          
        if (authResult instanceof NextResponse) {
        return authResult;
        }
        
        const { educator } = authResult as AuthContext;
        
        if (!educator) {
        return NextResponse.json(
            { msg: "Authentication failed" },
            { status: 401 }
        );
        }

    const { teachingFocus } = await req.json();
    
    console.log(teachingFocus)
    if (!Array.isArray(teachingFocus) || teachingFocus.some(item => typeof item !== 'string')) {
      throw new Error('Invalid teaching focus format');
    }
    
    const save = await Educator.findByIdAndUpdate(
       educator._id,{
      $set : { 
        teachingFocus 
       }}, 
      { new: true }
    );
    
    console.log(save)
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

        const authResult = await authEducatorMiddleware(req);
          
        if (authResult instanceof NextResponse) {
        return authResult;
        }
        
        const { educator } = authResult as AuthContext;
        
        if (!educator) {
        return NextResponse.json(
            { msg: "Authentication failed" },
            { status: 401 }
        );
        }
  
      console.log(educator.teachingFocus)
    return NextResponse.json({
      success: true,
      teachingFocus: educator?.teachingFocus || []
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch teaching focus' },
      { status: 500 }
    );
  }
}