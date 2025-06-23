import { connect } from "@/db/dbConfig";
import { Comment } from "@/models/models";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, props : { params: Promise<{ chapterId: string , courseId : string }> }) {
  await connect();

  try {
    const { chapterId, courseId } = await props.params;

    const comments = await Comment.find({ chapterId , courseId }).populate({
        "path" : "userId",
        "select" : "username email", 
        "model" : "User"
    }).populate({
        "path" : "educatorId",
        "select" : "educatorName email", 
        "model" : "Educator"
    })
    
    return NextResponse.json(
      { message: comments },
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