import { connect } from "@/db/dbConfig";
import { Comment, User } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ commentId: string }> }
): Promise<NextResponse> {
  await connect();

  try {
    const { commentId } = await props.params;

    const findUser = await Comment.findById(commentId); 
    if (!findUser) {
      return NextResponse.json({ msg: "Something went wrong" }, { status: 400 });
    }

    const userId = findUser.userId?.toString(); 

    if (!userId) {
      return NextResponse.json({ msg: "Something went wrong" }, { status: 400 });
    }

    const pullCommentId = await User.findByIdAndUpdate(
      userId,
      { $pull: { comment: commentId } },
      { new: true }
    );

    console.log("User after pulling comment:", pullCommentId);

    const deleteComment = await Comment.findByIdAndDelete(commentId);
    if (!deleteComment) {
      return NextResponse.json({ msg: "Something went wrong" }, { status: 400 });
    }

    return NextResponse.json(
      { msg: "Comment deleted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
