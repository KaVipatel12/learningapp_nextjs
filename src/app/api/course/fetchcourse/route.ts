import { connect } from "@/db/dbConfig";
import { Course, Review } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

interface QueryParams {
  page: number;
  limit: number;
  courseName?: string;
  educatorName?: string;
  category?: string;
  price?: "free" | "paid";
}

// Define the Course document shape (extend as needed)
interface CourseType {
  _id: mongoose.Types.ObjectId;
  title: string;
  educatorName: string;
  category: string;
  price: number;
  totalEnrollment: number;
  __v?: number;
  // Add other fields here if present in your schema
}

// Define shape with ratings
interface CourseWithRatings extends CourseType {
  averageRating: number;
  totalRatings: number;
  score: number;
}

export async function GET(req: NextRequest) {
  await connect();

  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const skip = (page - 1) * limit;

    const queryParams: QueryParams = {
      page,
      limit,
      courseName: searchParams.get("courseName") || undefined,
      educatorName: searchParams.get("educatorName") || undefined,
      category: searchParams.get("category") || undefined,
      price: searchParams.get("price") as "free" | "paid" | null ?? undefined,
    };

    const query: Record<string, unknown> = {};

    if (queryParams.courseName) {
      query.title = { $regex: queryParams.courseName, $options: "i" };
    }

    if (queryParams.educatorName) {
      query.educatorName = { $regex: queryParams.educatorName, $options: "i" };
    }

    if (queryParams.category) {
      query.category = { $regex: queryParams.category, $options: "i" };
    }

    if (queryParams.price === "free") {
      query.price = 0;
    } else if (queryParams.price === "paid") {
      query.price = { $gt: 0 };
    }

    // Aggregate review stats
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // Build a map for fast lookup
    const reviewStatsMap = new Map<
      string,
      { averageRating: number; totalRatings: number }
    >();

    reviewStats.forEach((stat) => {
      reviewStatsMap.set(stat._id.toString(), {
        averageRating: stat.averageRating,
        totalRatings: stat.totalRatings,
      });
    });

    query.status = "approved"
    // Fetch courses
    const rawCourses = (await Course.find(query)
      .sort({ totalEnrollment: -1 })
      .skip(skip)
      .limit(limit)
      .lean()) as CourseType[];

    // Add rating data
    const coursesWithRatings: CourseWithRatings[] = rawCourses.map((course) => {
      const stats = reviewStatsMap.get(course._id.toString());
      const averageRating = stats ? Number(stats.averageRating.toFixed(1)) : 0;
      const totalRatings = stats?.totalRatings ?? 0;
      const score = averageRating * Math.log(totalRatings + 1);

      return {
        ...course,
        averageRating,
        totalRatings,
        score,
      };
    });

    // Sort by rating score secondarily
    coursesWithRatings.sort((a, b) => {
      if (b.totalEnrollment !== a.totalEnrollment) {
        return b.totalEnrollment - a.totalEnrollment;
      }
      return b.score - a.score;
    });

    const totalCourses = await Course.countDocuments(query);

    return NextResponse.json(
      {
        msg: coursesWithRatings,
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalCourses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching filtered courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
