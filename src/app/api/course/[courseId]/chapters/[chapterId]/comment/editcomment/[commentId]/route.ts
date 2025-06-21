import { connect } from "@/db/dbConfig";
import { AuthContext, authUserMiddleware } from "@/app/middleware/authUserMiddleware";
import { Comment } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest, { params }: { params: { commentId : string}}) {
  await connect();

  try {
    const { commentId } = params;
    const { comment } = await req.json();

    // Check course access
    const authResult = await authUserMiddleware(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult as AuthContext;

    if (!user) {
      return NextResponse.json({ success: false, msg: "Authentication failed" }, { status: 401 });
    }

    const isUpdatable = user.comment.some(commentIds => commentIds.toString() === commentId)

    if(!isUpdatable){
        return NextResponse.json({msg : "You can't edit this comment"}, {status : 402})
    }
   const updateComment = await Comment.findByIdAndUpdate(
      commentId, 
      { 
        comment,
        updatedAt: new Date() // Explicitly set updatedAt
      },
      { new: true, runValidators: true } // Return updated doc and validate
    ).exec();

    if(!updateComment){
        return NextResponse.json({msg : "Something went wrong"}, {status : 400})
    }

    console.log("comment text" + comment)
    console.log("isUpdatable" + isUpdatable)
    console.log("commentId" + commentId)

    console.log(updateComment)
    return NextResponse.json(
      { msg: "Comment updated successfully"},
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting comment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}