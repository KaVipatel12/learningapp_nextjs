// Interfaces
interface ICourse {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
}

export interface ICourseWithReviews extends ICourse {
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
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  AuthContext,
  authUserMiddleware,
} from "@/app/middleware/authUserMiddleware";

// Get all courses with review statistics
export async function GET(req: NextRequest) {
  await connect();

  const authResult = await authUserMiddleware(req);

  // If the result is a NextResponse, it means there was an error or unauthorized access, NextResponse object wo response hota hai jo hum Next.js mein error ya unauthorized response bhejte hain. Agar authResult NextResponse hai, iska matlab hai kuch error ya unauthorized access hai.

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Extract the authenticated user data from the context
  const { user } = authResult as AuthContext;

  if (!user) {
    return NextResponse.json({ msg: "Authentication failed" }, { status: 401 });
  }

  try {
    if (user.category.length === 0) {
      return NextResponse.json({ msg: "No course available" }, { status: 400 });
    }

    const courses = await Course.find({ category: { $in: user.category } , status : "live" });

    if (courses.length === 0) {
      return NextResponse.json({ msg: "No course available" }, { status: 400 });
    }

    const courseIds = courses.map((course) => course._id);

    const reviewStats = await Review.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
        },
      },
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const reviewStatsMap = new Map<string, IReviewStats>();
    reviewStats.forEach((stat) => {
      reviewStatsMap.set(stat._id.toString(), {
        averageRating: stat.averageRating,
        totalRatings: stat.totalRatings,
      });
    });

    const coursesWithReviews: ICourseWithReviews[] = courses.map((course) => {
      const stats = reviewStatsMap.get(course._id.toString());
      return {
        ...course.toObject(),
        averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
        totalRatings: stats?.totalRatings || 0,
      };
    });

      coursesWithReviews.sort((a, b) => {
      const scoreA = a.averageRating * Math.log(a.totalRatings + 1);
      const scoreB = b.averageRating * Math.log(b.totalRatings + 1);
      return scoreB - scoreA; 
    });

    return NextResponse.json({ msg: coursesWithReviews }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses with reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses with review data" },
      { status: 500 }
    );
  }
}
