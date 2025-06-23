import { connect } from "@/db/dbConfig";
import { CourseAccessContext, courseAccessMiddleware } from "@/app/middleware/courseAccessMiddleware";
import { Review } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, props : { params: Promise<{ courseId: string }> }) {
  await connect();

  try {
    const { courseId } = await props.params;
    const { rating } = await req.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check course access
    const authResult = await courseAccessMiddleware(req, courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
 
    const { user } = authResult as CourseAccessContext;
    if (!user) {
        return NextResponse.json({ success: false, msg: "Authentication failed" }, { status: 401 });
    }

    const userId = user._id;

    // Check if review already exists
    const existingReview = await Review.findOne({
      courseId,
      userId
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      await existingReview.save();
      return NextResponse.json(
        { message: "Rating updated successfully", review: existingReview },
        { status: 200 }
      );
    } else {
      // Create new review
      const newReview = await Review.create({
        courseId,
        userId,
        rating
      });
      return NextResponse.json(
        { message: "Rating submitted successfully", review: newReview },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest,  props : { params: Promise<{ courseId: string }> }) {
  await connect();

  try {
    const { courseId } = await props.params;

    const authResult = await courseAccessMiddleware(req, courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
 
    const { user } = authResult as CourseAccessContext;
    if (!user) {
        return NextResponse.json({ success: false, msg: "Authentication failed" }, { status: 401 });
    }

    const userId = user._id;

    const userReview = await Review.findOne({
      courseId,
      userId
    });

    return NextResponse.json({
      msg : userReview?.rating || null,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}