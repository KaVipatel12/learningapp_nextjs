import { authUserMiddleware } from "@/app/middleware/authUserMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { History } from "@/models/models";

export const GET = async (req: NextRequest) => {
  try {
    const authResult = await authUserMiddleware(req);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const userId = user?._id;

    if (!userId) {
      return NextResponse.json({ success: false, msg: "User ID not found" }, { status: 400 });
    }

    const historyList = await History.find({ userId })
      .populate("courseId", "title imageUrl")
      .populate("chapterId")
      .sort({ lastWatchedAt: -1 });

      console.log(historyList)
    return NextResponse.json({
      success: true,
      history: historyList
    });
  } catch (error) {
    console.error("Fetch history error:", error);
    return NextResponse.json(
      {
        success: false,
        msg: "Failed to fetch history",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};
