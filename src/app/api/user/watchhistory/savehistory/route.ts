import { authUserMiddleware } from "@/app/middleware/authUserMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { History } from "@/models/models"; // Assuming you exported it from models.ts

export const POST = async (req: NextRequest) => {
  try {
    const authResult = await authUserMiddleware(req);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const userId = user?._id;

    
    const {
      courseId,
      chapterId,      
      watchedTime,
      totalDuration
    } = await req.json();

    console.log(watchedTime)
    const completed = watchedTime >= totalDuration;

    // Find and update or insert
    const updatedHistory = await History.findOneAndUpdate(
      {
        userId,
        courseId,
        chapterId
      },
      {
        watchedTime,
        totalDuration,
        lastWatchedAt: new Date(),
        completed
      },
      { upsert: true, new: true }
    );

    console.log(updatedHistory)
    return NextResponse.json({
      success: true,
      msg: "Watch history saved",
      history: updatedHistory
    });

  } catch (error) {
    console.error("Watch history error:", error);
    return NextResponse.json(
      {
        success: false,
        msg: "Failed to save history",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
