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

import { connect } from "@/db/dbConfig";
import { Course, Review } from "@/models/models";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    // Get all review stats in one go
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    console.log("reviewStats" , reviewStats)
    const reviewStatsMap = new Map<string, { averageRating: number; totalRatings: number }>();
    reviewStats.forEach(stat => {
      reviewStatsMap.set(stat._id.toString(), {
        averageRating: stat.averageRating,
        totalRatings: stat.totalRatings
      });
    });

console.log("reviewStatsMap", Array.from(reviewStatsMap.entries()));
    //  Get all courses (MongoDB level sorting & pagination by purchases only)
    const courses = await Course.find({})
      .sort({ totalEnrollment: -1 }) // primary sort
      .skip(skip)
      .limit(pageSize)
      .lean(); // for faster processing

      console.log("courses" + courses)
    // Attach rating data & sort secondarily in JS
    const coursesWithRatings = courses.map(course  => {
      const stats = reviewStatsMap.get(course?._id!.toString());
      const averageRating = stats ? Number(stats.averageRating.toFixed(1)) : 0;
      const totalRatings = stats?.totalRatings || 0;
      const score = averageRating * Math.log(totalRatings + 1);

      return {
        ...course,
        averageRating,
        totalRatings,
        score
      };
    });

    console.log("coursesWithRatings" , coursesWithRatings)
    // Secondary sort (after purchases) using score
    coursesWithRatings.sort((a, b) => {
      if (b.totalEnrollment !== a.totalEnrollment) {
        return b?.totalEnrollment - a?.totalEnrollment;
      }
      return b.score - a.score;
    });

    // Get total course count for frontend
    const totalCourses = await Course.countDocuments();

console.log("final", coursesWithRatings);

    return NextResponse.json({
      msg: coursesWithRatings,
      currentPage: page,
      totalPages: Math.ceil(totalCourses / pageSize),
      totalCourses
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching paginated courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
