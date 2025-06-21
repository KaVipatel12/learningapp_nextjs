import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { User } from '@/models/models';
import { Course } from '@/models/models'; // Add Course model import
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

interface CoursePurchase {
  courseId: string;
}

// Request body expected from frontend
interface PurchaseCourseRequest {
  courses: CoursePurchase[] | string[]; // Accept both object and string formats
}

export const PUT = async (req: NextRequest) => {
  try {
    // Authenticate user
    const authResult = await authUserMiddleware(req);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult as AuthContext;
    if (!user) {
      return NextResponse.json({ success: false, msg: "Authentication failed" }, { status: 401 });
    }

    const userId = user._id;
    const body: PurchaseCourseRequest = await req.json();

    // Normalize courses into objects with courseId
    const inputCourses: CoursePurchase[] = (body?.courses || []).map(course =>
      typeof course === 'string' ? { courseId: course } : course
    );

    if (!Array.isArray(inputCourses) || inputCourses.length === 0) {
      return NextResponse.json({ success: false, msg: "No courses provided" }, { status: 400 });
    }

    // Filter valid ObjectIds
    const validCourses = inputCourses.filter(c =>
      c.courseId && mongoose.Types.ObjectId.isValid(c.courseId)
    );

    if (validCourses.length === 0) {
      return NextResponse.json({ success: false, msg: "Invalid course IDs" }, { status: 400 });
    }

    // Get user's already purchased courses
    const userDoc = await User.findById(userId).select('purchaseCourse');
    const alreadyPurchased = new Set(
      userDoc?.purchaseCourse?.map((p : CoursePurchase) => p?.courseId?.toString()) || []
    );

    // Filter out duplicates
    const newCourses = validCourses.filter(c => !alreadyPurchased.has(c.courseId));

    if (newCourses.length === 0) {
      return NextResponse.json({
        success: false,
        msg: validCourses.length === 1
          ? "Course is already purchased"
          : "All selected courses are already purchased"
      }, { status: 400 });
    }

    // Push new courses into user document
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          purchaseCourse: {
            $each: newCourses.map(c => ({
              courseId: new mongoose.Types.ObjectId(c.courseId),
              purchaseDate: new Date()
            }))
          }
        }
      },
      { new: true }
    );

    // Increment totalEnrollment for each purchased course
    const courseIds = newCourses.map(c => new mongoose.Types.ObjectId(c.courseId));
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $inc: { totalEnrollment: 1 } }
    );

    return NextResponse.json({
      success: true,
      msg: `${newCourses.length} course(s) purchased successfully`,
      purchasedCourses: newCourses.map(c => c.courseId)
    });

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({
      success: false,
      msg: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};