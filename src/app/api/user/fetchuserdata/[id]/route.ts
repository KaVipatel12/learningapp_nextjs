import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db/dbConfig";
import { User }  from "@/models/models";


export async function GET(
        req: NextRequest,
        props: { params: Promise<{ id : string }> }
      ) {
        
          
  try {
        await connect();
        const {id}  = await props.params;
      
        console.log(id)
    const fetchDetails = await User.findById(id)
      .populate({
        path: "purchaseCourse.courseId",
        model: "Course"
      })
      .populate({
        path: "courses",
        model: "Course"
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
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { msg: "Unexpected error occurred", error: errMsg },
      { status: 500 }
    );
  }
}