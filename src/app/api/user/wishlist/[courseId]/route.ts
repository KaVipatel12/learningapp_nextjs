import { AuthContext, authUserMiddleware } from '@/middleware/authUserMiddleware';
import { User } from '@/models/models';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  const authResult = await authUserMiddleware(req);
  
  try {
    // Authentication check
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
    
    // Properly access the courseId from params (no need for await)
    const { courseId } = params;
    console.log("Working with courseId:", courseId);

    if (!courseId) {
      return NextResponse.json(
        { success: false, msg: 'Invalid courseId' },
        { status: 400 }
      );
    }

    // Ensure wishlist exists on user object
    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Convert courseId to ObjectId for proper comparison
    let courseObjectId;
    try {
      courseObjectId = new mongoose.Types.ObjectId(courseId);
    } catch {
      return NextResponse.json(
        { success: false, msg: 'Invalid courseId format' },
        { status: 400 }
      );
    }

    // Check if course exists in wishlist by comparing ObjectId values
    const isCourseInWishlist = user.wishlist.some(id => 
      id.toString() === courseObjectId.toString()
    );

    console.log("isCourseInWishlist:", isCourseInWishlist); 

    if (isCourseInWishlist) {
      // Remove from wishlist
      const response = await User.findByIdAndUpdate(
        user._id,
        { $pull: { wishlist: courseObjectId } },
        { new: true } // Return the updated document
      );

      console.log("Removed from wishlist, updated user:", response);
      return NextResponse.json(
        { success: true, msg: 'Removed from wishlist', isWishlisted: false },
        { status: 200 }
      );
    } else {
      // Add to wishlist
      const response = await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { wishlist: courseObjectId } },
        { new: true } // Return the updated document
      );
      
      console.log("Added to wishlist, updated user:", response);
      return NextResponse.json(
        { success: true, msg: 'Added to wishlist', isWishlisted: true },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Wishlist update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        msg: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
