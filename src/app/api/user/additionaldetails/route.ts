// app/api/user/updatecategories/route.ts
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { User }  from '@/models/models';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = async (req: NextRequest) => {
  const authResult = await authUserMiddleware(req);
  
  try {
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult as AuthContext;
    
    if (!user) {
      return NextResponse.json(
        { success: false, msg: "Authentication failed" },
        { status: 401 }
      );
    }
    
    const userId = user._id;

    if (user.mobile){
       return NextResponse.json(
        { success: false, msg: 'Details already saved' },
        { status: 401 }
      );
    }
    const { mobile , role } = await req.json();

    if (!mobile && !role) {
      return NextResponse.json(
        { success: false, msg: 'Invalid categories data' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { mobile , role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, msg: 'Failed to add the additional details' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        msg: 'Additional details added successfully',
        data: { categories: updatedUser.category }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to add the additional details:', error);
    return NextResponse.json(
      { 
        success: false, 
        msg: 'Internal server error',
      },
      { status: 500 }
    );
  }
};