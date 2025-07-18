import { connect } from "@/db/dbConfig";
import { CourseAccessContext, courseAccessMiddleware } from "@/app/middleware/courseAccessMiddleware";
import { Comment, User } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { commentId: string } }
): Promise<NextResponse> {
  await connect();

  try {
    const { commentId } = params;

    // Find the comment with course and user references
    const comment = await Comment.findById(commentId)
      .populate('courseId', 'educator')
      .populate('userId', '_id');

    if (!comment) {
      return NextResponse.json(
        { msg: "Comment not found" }, 
        { status: 404 }
      );
    }

    // Verify course access
    const authResult = await courseAccessMiddleware(req, comment.courseId._id.toString());
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult as CourseAccessContext;

    // Check permissions
    const isCommentAuthor = user._id.toString() === comment.userId?._id.toString();
    const isCourseOwner = user._id.toString() === comment.courseId.educator.toString();
    const isAdmin = user.role === 'admin';

    if (!isCommentAuthor && !isCourseOwner && !isAdmin) {
      return NextResponse.json(
        { msg: "Unauthorized to delete this comment" }, 
        { status: 403 }
      );
    }

    // Remove comment from user's comments array if exists
    if (comment.userId) {
      await User.findByIdAndUpdate(
        comment.userId._id,
        { $pull: { comment: commentId } },
        { new: true }
      );
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json(
      { msg: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}