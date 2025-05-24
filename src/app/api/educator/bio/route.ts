import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db/dbConfig';
import { AuthContext, authEducatorMiddleware } from '@/middleware/authEducatorMiddleware';
import { Educator } from '@/models/models';

export async function PUT(req: NextRequest) {
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

    const { bio } = await req.json();

    const save = await Educator.findByIdAndUpdate(
       educator._id,{ 
        bio 
       }, 
      { new: true }
    );
    
    console.log(save)
    return NextResponse.json({
      success: true,
      msg: 'Bio saved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : 'Failed to save Bio' },
      { status: 500 }
    );
  }
}
