// app/api/user/updatecategories/route.ts
import { AuthContext, authUserMiddleware } from '@/middleware/authUserMiddleware';
import User from '@/models/userModel';
import { Document } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export interface IUser extends Document {
  _id: string;
  category: string[];
}

export const PUT = async (req: NextRequest) => {
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
    const { categories }: { categories: string[] } = await req.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, msg: 'Invalid categories data' },
        { status: 400 }
      );
    }

    if (categories.length > 3) {
      return NextResponse.json(
        { 
          success: false, 
          msg: 'Maximum 3 categories allowed',
          data: { maxCategories: 3 }
        },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { category: categories } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, msg: 'Failed to update categories' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        msg: 'Categories updated successfully',
        data: { categories: updatedUser.category }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        msg: 'Internal server error',
      },
      { status: 500 }
    );
  }
};