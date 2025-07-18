import { connect } from "@/db/dbConfig";
import { AuthContext, authUserMiddleware } from "@/app/middleware/authUserMiddleware";
import { Comment } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { commentId: string } }
): Promise<NextResponse> {
  await connect();

  try {
    const { commentId } = await params;
    const { comment: newCommentText } = await req.json();

    // Validate input
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, msg: "Invalid comment ID" },
        { status: 400 }
      );
    }

    if (!newCommentText || typeof newCommentText !== 'string') {
      return NextResponse.json(
        { success: false, msg: "Valid comment text is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await authUserMiddleware(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult as AuthContext;

    // Find the comment
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return NextResponse.json(
        { success: false, msg: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user is the author or admin
    const isAuthor = user?._id.toString() === existingComment.userId?.toString();
    const isAdmin = user?.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, msg: "Unauthorized to edit this comment" },
        { status: 403 }
      );
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        comment: newCommentText,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email');

    if (!updatedComment) {
      return NextResponse.json(
        { success: false, msg: "Failed to update comment" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        msg: "Comment updated successfully",
        comment: updatedComment
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}