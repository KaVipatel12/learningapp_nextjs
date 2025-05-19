// Interfaces
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

// For the course fetch endpoint
import { connect } from "@/db/dbConfig";
import { Course, Review } from "@/models/models";
import {NextResponse } from "next/server";
import mongoose from "mongoose";

// Get all courses with review statistics
export async function GET() {
  await connect();
  
  try {
    // Fetch all courses
    const courses = await Course.find({});
    
    // Aggregate review statistics for all courses
    const reviewStats = await Review.aggregate([
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
    
    // Combine courses with their review stats
    const coursesWithReviews: ICourseWithReviews[] = courses.map(course => {
      const stats = reviewStatsMap.get(course._id.toString());
      return {
        ...course.toObject(),
        averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
        totalRatings: stats?.totalRatings || 0
      };
    });
    
    return NextResponse.json({msg : coursesWithReviews}, {status : 200});
  } catch (error) {
    console.error("Error fetching courses with reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses with review data" },
      { status: 500 }
    );
  }
}
