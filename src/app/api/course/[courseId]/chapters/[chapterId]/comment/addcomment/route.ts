import { connect } from "@/db/dbConfig";
import { CourseAccessContext, courseAccessMiddleware } from "@/middleware/courseAccessMiddleware";
import { Comment, Educator, User } from "@/models/models";
import mongoose, { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export interface ICommentInput {
  comment: string;
  userId?: Types.ObjectId | string;
  chapterId: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  educatorId?: Types.ObjectId | string;
  commentId?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export async function PUT(req: NextRequest, { params }: { params: { chapterId: string , courseId : string } }) {
  await connect();

  try {
    const { chapterId, courseId } = params;
    const { comment: commentText } = await req.json();

    // Check course access
    const authResult = await courseAccessMiddleware(req, courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult as CourseAccessContext;

    if (!user) {
      return NextResponse.json({ success: false, msg: "Authentication failed" }, { status: 401 });
    }

    // Prepare comment data based on user role

    const objectChapterId = new mongoose.Types.ObjectId(chapterId); 
    const objectCourseId = new mongoose.Types.ObjectId(courseId);

    const commentData : ICommentInput = {
      comment: commentText,
      chapterId : objectChapterId,
      courseId : objectCourseId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (user.role === 'student') {
      commentData.userId = user._id;
    } else if (user.role === 'educator') {
      commentData.educatorId = user._id;
    }

    const newComment = await Comment.create(commentData);
    
    if(!newComment){
      return NextResponse.json(
        { msg: "Something went wrong" },
        { status: 400 }
      );
    }

    if(user.role === "student"){
      const userId = user._id; 
      await User.findByIdAndUpdate(userId , {
        $push : {
          comment : newComment._id
        }
      },
      {new : true}
    )
  }else if(user.role === "educator"){
    const educatorId = user._id; 
   await Educator.findByIdAndUpdate(educatorId , {
      $push : {
        comment : newComment._id
      }
    },
    {new : true}
  )

  }
    return NextResponse.json(
      { msg: "Comment added successfully", comment: newComment },
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