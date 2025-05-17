import { NextRequest, NextResponse } from "next/server";
import { authUserMiddleware, AuthContext } from "@/middleware/authUserMiddleware";
import { connect } from "@/db/dbConfig";
import { User }  from "@/models/models";

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
    
    console.log(user)
    try {
      const userId = user._id;
      
const fetchWishlist = await User.findById(userId, "wishlist")
  .populate({
    path: "wishlist",
    model: "Course"
  });

      
      if (!fetchWishlist) {
        return NextResponse.json(
          { msg: "No wishlist" },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ msg: fetchWishlist }, { status: 200 });
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