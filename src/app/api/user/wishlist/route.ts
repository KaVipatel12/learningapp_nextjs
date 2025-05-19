import { NextRequest, NextResponse } from "next/server";
import { authUserMiddleware, AuthContext } from "@/middleware/authUserMiddleware";
import { connect } from "@/db/dbConfig";
import { User, Review }  from "@/models/models";
import mongoose from "mongoose";
import { Document } from "mongoose";

// Define interfaces
interface ICourse {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  // Add other course properties as needed
}

interface ICourseWithReviews extends ICourse {
  averageRating: number;
  totalRatings: number;
}

interface IReviewStats {
  averageRating: number;
  totalRatings: number;
}

// Type for Mongoose document
type CourseDocument = Document & ICourse;

export async function GET(req: NextRequest) {
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
    
    try {
      const userId = user._id;
      
      // Fetch user's wishlist
      const fetchWishlist = await User.findById(userId, "wishlist")
        .populate({
          path: "wishlist",
          model: "Course"
        });
      
      if (!fetchWishlist) {
        return NextResponse.json(
          { msg: "No wishlist" },
          { status: 400 }
        );
      }
      
      // Get all course IDs from the wishlist - without type annotation
      const courseIds = fetchWishlist.wishlist.map((course : CourseDocument) => course._id);
      
      // Aggregate review statistics for wishlist courses
      const reviewStats = await Review.aggregate([
        {
          $match: {
            courseId: { $in: courseIds }
          }
        },
        {
          $group: {
            _id: "$courseId",
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 }
          }
        }
      ]);
      
      // Create a map for easy lookup
      const reviewStatsMap = new Map<string, IReviewStats>();
      reviewStats.forEach(stat => {
        reviewStatsMap.set(stat._id.toString(), {
          averageRating: stat.averageRating,
          totalRatings: stat.totalRatings
        });
      });
      
      // Combine wishlist courses with their review stats - without explicit type annotation
      const wishlistWithReviews = fetchWishlist.wishlist.map((course : CourseDocument ) => {
        const stats = reviewStatsMap.get(course._id.toString());
        
        // Convert Mongoose document to plain object
        const courseData = course.toObject ? course.toObject() : { ...course };
        
        // Add review stats
        return {
          ...courseData,
          averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
          totalRatings: stats?.totalRatings || 0
        } as ICourseWithReviews;
      });
      
      return NextResponse.json({
        msg: wishlistWithReviews
      }, { status: 200 });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching user wishlist:", error);
      return NextResponse.json(
        { msg: "Error fetching user wishlist", error: errMsg },
        { status: 500 }
      );
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { msg: "Unexpected error occurred", error: errMsg },
      { status: 500 }
    );
  }
}