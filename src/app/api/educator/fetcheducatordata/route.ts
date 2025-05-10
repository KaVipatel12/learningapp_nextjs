import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db/dbConfig";
import { AuthContext, authEducatorMiddleware } from "@/middleware/authEducatorMiddleware";
import Educator from "@/models/educatorModel";

export async function GET(req: NextRequest) {
  try {
    await connect();

    // Call the middleware to authenticate the educator
    const authResult = await authEducatorMiddleware(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Extract the authenticated user data from the context
    const { educator } = authResult as AuthContext;
    
    if (!educator) {
      return NextResponse.json(
        { msg: "Authentication failed" },
        { status: 401 }
      );
    }
    
    console.log(educator)
    // Now we can use the user data to fetch more information
    try {
      const educatorId = educator._id;
      
      const fetchDetails = await Educator.findById(
        educatorId
      ); 
      
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