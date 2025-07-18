import { connect } from "@/db/dbConfig";
import { CourseAccessContext, courseAccessMiddleware } from "@/app/middleware/courseAccessMiddleware";
import { Comment, User } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { chapterId: string; courseId: string } }
): Promise<NextResponse> {
  await connect();

  try {
    const { chapterId, courseId } = await params;
    const { comment: commentText } = await req.json();

    // Verify course access
    const authResult = await courseAccessMiddleware(req, courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult as CourseAccessContext;

    if (!user) {
      return NextResponse.json(
        { success: false, msg: "Authentication failed" }, 
        { status: 401 }
      );
    }

    // Create new comment
    const newComment = await Comment.create({
      comment: commentText,
      chapterId,
      courseId,
      userId: user._id,
      ...(user.role === 'educator' && { educatorId: user._id })
    });

    if (!newComment) {
      return NextResponse.json(
        { msg: "Failed to create comment" }, 
        { status: 400 }
      );
    }

    // Update user's comments array
    await User.findByIdAndUpdate(
      user._id,
      { $push: { comment: newComment._id } },
      { new: true }
    );

    return NextResponse.json(
      { 
        msg: "Comment added successfully", 
        comment: newComment 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}