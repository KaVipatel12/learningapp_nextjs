import { connect } from "@/db/dbConfig";
import { Comment } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { chapterId: string; courseId: string } }
): Promise<NextResponse> {
  await connect();

  try {
    const { chapterId, courseId } = await params;

    // Validate parameters
    if (!chapterId || !courseId) {
      return NextResponse.json(
        { error: "Chapter ID and Course ID are required" },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ chapterId, courseId })
      .populate({
        path: "userId",
        select: "username email role",
        model: "User"
      })
      .populate({
        path: "educatorId",
        select: "username email",
        model: "User"
      })
      .sort({ createdAt: 1 }); // Sort by creation date

    return NextResponse.json(
      { 
        success: true,
        message: "Comments fetched successfully",
        comments 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}