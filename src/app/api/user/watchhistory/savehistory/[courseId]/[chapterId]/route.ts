import { authUserMiddleware } from "@/app/middleware/authUserMiddleware";
import { History } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ courseId: string , chapterId : string }> }
) {

  const { courseId , chapterId } = await props.params;

  try {
    const authResult = await authUserMiddleware(req);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const userId = user?._id;

    console.log(courseId , chapterId , userId)
    // Find user and get the watched history of the specific video
    const fetchHistory = await History.findOne(
      {
        userId,
        courseId,
        chapterId
      }
    );

    console.log(fetchHistory)
    return NextResponse.json({
      success: true,
      msg: fetchHistory.watchedTime
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
