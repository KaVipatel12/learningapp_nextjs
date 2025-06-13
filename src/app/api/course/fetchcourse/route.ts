import { connect } from "@/db/dbConfig";
import { Course, Review } from "@/models/models";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connect();

  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    // Extract filters
    const courseName = searchParams.get("courseName");
    const educatorName = searchParams.get("educatorName");
    const category = searchParams.get("category");
    const price = searchParams.get("price");

    // Build MongoDB query object
    const query: any = {};

    if (courseName) {
      query.title = { $regex: courseName, $options: "i" };
    }

    if (educatorName) {
      query.educatorName = { $regex: educatorName, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (price === "free") {
      query.price = 0;
    } else if (price === "paid") {
      query.price = { $gt: 0 };
    }

    // Get review stats
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const reviewStatsMap = new Map<string, { averageRating: number; totalRatings: number }>();
    reviewStats.forEach((stat) => {
      reviewStatsMap.set(stat._id.toString(), {
        averageRating: stat.averageRating,
        totalRatings: stat.totalRatings,
      });
    });

    // Get filtered courses
    const courses = await Course.find(query)
      .sort({ totalEnrollment: -1 }) // primary sort
      .skip(skip)
      .limit(limit)
      .lean();

    // Add ratings
    const coursesWithRatings = courses.map((course: any) => {
      const stats = reviewStatsMap.get(course._id.toString());
      const averageRating = stats ? Number(stats.averageRating.toFixed(1)) : 0;
      const totalRatings = stats?.totalRatings || 0;
      const score = averageRating * Math.log(totalRatings + 1);

      return {
        ...course,
        averageRating,
        totalRatings,
        score,
      };
    });

    // Secondary sort by rating score
    coursesWithRatings.sort((a, b) => {
      if (b.totalEnrollment !== a.totalEnrollment) {
        return b.totalEnrollment - a.totalEnrollment;
      }
      return b.score - a.score;
    });

    // Count total (with filters)
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
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
