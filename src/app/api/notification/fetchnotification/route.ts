import { NextRequest, NextResponse } from "next/server";
import { authUserMiddleware, AuthContext } from "@/app/middleware/authUserMiddleware";
import { connect } from "@/db/dbConfig";
import { Notification }  from "@/models/models";

export async function GET(req: NextRequest) {
  try {
    await connect();
    
    const authResult = await authUserMiddleware(req);    

    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult as AuthContext;
    
    if (!user) {
      return NextResponse.json(
        { msg: "Authentication failed" },
        { status: 401 }
      );
    }
    
    try {
      const userId = user._id;
      
    const fetchNotifications = await Notification.find({userId})
    .populate({
        path: 'courseId',          
        select: 'title'     
    })
    .populate({
        path: 'chapterId',          
        select: 'title'     
    })
    .populate({
        path: 'commentId',
        select: 'comment',
    });

      
      if (!fetchNotifications) {
        return NextResponse.json(
          { msg: "Login to view the profile" },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ msg: fetchNotifications }, { status: 200 });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
        { msg: "Error fetching user profile", error: errMsg },
        { status: 500 }
      );
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { msg: "Unexpected error occurred", error: errMsg },
      { status: 500 }
    );
  }
}