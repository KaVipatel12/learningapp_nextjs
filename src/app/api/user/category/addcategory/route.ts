// types.ts (shared types)
import { AuthContext, authUserMiddleware } from '@/middleware/authUserMiddleware';
import User from '@/models/userModel';
import { Document } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export interface IUser extends Document {
  _id: string;
  // other user fields
  category: string[];
}

export const POST = async (req: NextRequest) => {
      // Call the middleware to authenticate the user
      const authResult = await authUserMiddleware(req);
      
  try {
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
      
    const userId = user._id;
    const { categories }: { categories: string[] } = await req.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, message: 'Invalid categories data' },
        { status: 400 }
      );
    }

    const alreadyAvailableCategories = user.category;
    if (alreadyAvailableCategories.length >= 3) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Categories already available',
          data: { maxCategories: 3 }
        },
        { status: 400 }
      );
    }

    // Filter out duplicates
    const newCategories = categories.filter(
      (item) => !alreadyAvailableCategories.includes(item)
    );

    if (newCategories.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Categories already added' },
        { status: 400 }
      );
    }

    // Update user categories
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { category: { $each: newCategories } } }, // Using $addToSet to prevent duplicates
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update categories' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Categories added successfully',
        data: { categories: updatedUser.category }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
};