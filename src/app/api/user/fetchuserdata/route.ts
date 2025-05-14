import { NextRequest, NextResponse } from "next/server";
import { authUserMiddleware, AuthContext } from "@/middleware/authUserMiddleware";
import { connect } from "@/db/dbConfig";
import User from "@/models/userModel";

export async function GET(req: NextRequest) {
  try {
    await connect();
    
    // Call the middleware to authenticate the user
    const authResult = await authUserMiddleware(req);
    
    // If the result is a NextResponse, it means there was an error or unauthorized access, NextResponse object wo response hota hai jo hum Next.js mein error ya unauthorized response bhejte hain. Agar authResult NextResponse hai, iska matlab hai kuch error ya unauthorized access hai.

    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Extract the authenticated user data from the context
    const { user } = authResult as AuthContext;
    
    if (!user) {
      return NextResponse.json(
        { msg: "Authentication failed" },
        { status: 401 }
      );
    }
    
    console.log(user)
    // Now we can use the user data to fetch more information
    try {
      const userId = user._id;
      
      const fetchDetails = await User.findById(
        userId,
        "username mobile email purchaseCourse controll cart category"
      ).populate({
        path: "cart",
        populate: {
          path: "cartItems.courseId",
          model: "Course",
        },
      });
      
      if (!fetchDetails) {
        return NextResponse.json(
          { msg: "Login to view the profile" },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ msg: fetchDetails }, { status: 200 });
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