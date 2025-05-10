import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import Educator from "@/models/educatorModel";
import { connect } from "@/db/dbConfig";
import { Types } from "mongoose";

// Extend JwtPayload to include your custom fields
export interface CustomJwtPayload extends JwtPayload {
  email: string;
  id: string;
  role: string;
}

// Define context type for course modification
export interface CourseModifyContext {
  Educator?: InstanceType<typeof Educator>;
  isCourseModify: boolean;
}

/**
 * Middleware to verify if Educator can modify a specific course
 * @param req The Next.js request object
 * @param courseId The course ID to check permissions for
 * @returns Either an error response or the context with Educator data
 */
export async function courseModifyMiddleware(
  req: NextRequest,
  courseId: string
): Promise<CourseModifyContext | NextResponse> {
  try {
    await connect();
    
    console.log("Middleware courseId " + courseId)
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { msg: "Unauthorized HTTP, Token not provided" },
        { status: 401 }
      );
    }

    const jwtToken = token.replace('Bearer', "").trim();

    try {
      const decoded = jwt.verify(
        jwtToken,
        process.env.JWT_SECRET as string
      ) as CustomJwtPayload;

      if (!decoded.email) {
        console.log("Invalid token")
        return NextResponse.json(
          { msg: "Invalid token payload" },
          { status: 403 }
        );
      }

      const EducatorData = await Educator.findOne({ email: decoded.email });

      if (!EducatorData) {
        console.log("educator not found")
        return NextResponse.json({ msg: "Educator not found" }, { status: 404 });
      }

      // Check provider role and course ownership
      if (EducatorData.role !== "educator") {
        console.log("Unauthorized access")
        return NextResponse.json(
          { msg: "Unauthorized Access" },
          { status: 403 }
        );
      }

      const EducatorVerify = EducatorData.courses.some((data: Types.ObjectId) => data.equals(courseId));
      
      if (!EducatorVerify) {
        console.log("Unauthorized access course not found ")
        return NextResponse.json(
          { msg: "Unauthorized Access - Course not found" },
          { status: 403 }
        );
      }

      // Return the context for route handler
      return {
        Educator: EducatorData,
        isCourseModify: true
      };

    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        { msg: "Token verification error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { msg: "Internal server error" },
      { status: 500 }
    );
  }
}