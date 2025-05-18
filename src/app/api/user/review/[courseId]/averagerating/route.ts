import { connect } from "@/db/dbConfig";
import { Review } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  await connect();

  try {
    const { courseId } = await params;

    // Convert string courseId to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const ratings = await Review.find({ courseId: courseObjectId });
    console.log("Found ratings:", ratings);

    // Get average rating and total ratings count
    const result = await Review.aggregate([
      { $match: { courseId: courseObjectId } },  // Use ObjectId here
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    console.log("Aggregation result:", result);

    // If no ratings exist yet
    if (result.length === 0) {
      return NextResponse.json({
        averageRating: 0,
        totalRatings: 0,
      });
    }

    return NextResponse.json({
      averageRating: Number(result[0].averageRating).toFixed(1),
      totalRatings: result[0].totalRatings
    });

  } catch (error) {
    console.error("Error fetching course ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch course ratings" },
      { status: 500 }
    );
  }
}