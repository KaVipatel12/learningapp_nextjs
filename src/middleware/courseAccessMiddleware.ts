import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import Educator from "@/models/educatorModel";
import User from "@/models/userModel";
import { connect } from "@/db/dbConfig";
import { Types } from "mongoose";

// Extend JwtPayload to include your custom fields
export interface CustomJwtPayload extends JwtPayload {
  email: string;
  id: string;
  role: string;
}

// Define context type for course access
export interface CourseAccessContext {
  user?: InstanceType<typeof Educator> | InstanceType<typeof User>;
  courseAccess: boolean;
  courseModify: boolean;
}

/**
 * Middleware to verify if user has access to a specific course
 * @param req The Next.js request object
 * @param courseId The course ID to check access for
 * @returns Either an error response or the context with user data and access status
 */
export async function courseAccessMiddleware(
  req: NextRequest,
  courseId: string
): Promise<CourseAccessContext | NextResponse> {
  try {
    await connect();
    
    const token = req.cookies.get('token')?.value; 
    
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized HTTP, Token not provided", courseAccess: false },
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
        return NextResponse.json(
          { msg: "Invalid token payload", courseAccess: false },
          { status: 403 }
        );
      }

      const educatorData = await Educator.findOne({ email: decoded.email });
      const userData = await User.findOne({ email: decoded.email });

      if (!educatorData && !userData) {
        return NextResponse.json(
          { msg: "User not found", courseAccess: false },
          { status: 401 }
        );
      }

      if (educatorData) {
        if (educatorData.role === "educator") {
            console.log("new")
            console.log(educatorData.courses)
          const educatorVerify = educatorData.courses.some((data: Types.ObjectId) => 
            data.equals(courseId));
          
          if (educatorVerify) {
            return {
              user: educatorData,
              courseAccess: true,
              courseModify : true
            };
          } else {
            return NextResponse.json(
              { msg: "Unauthorized Access", courseAccess: false },
              { status: 403 }
            );
          }
        } else {
          return NextResponse.json(
            { msg: "Unauthorized Access", courseAccess: false },
            { status: 403 }
          );
        }
      } 
      
      if (userData) {
        const isCoursePurchased = userData.purchaseCourse.some(
          (data => data.courseId === courseId.toString())
        );
        
        if (isCoursePurchased) {
          return {
            user: userData,
            courseAccess: true, 
            courseModify : false
          };
        } else {
          return NextResponse.json(
            { msg: "Course not purchased", courseAccess: false },
            { status: 403 }
          );
        }
      }

      // Fallback for any other case
      return NextResponse.json(
        { msg: "Unauthorized Access", courseAccess: false },
        { status: 403 }
      );

    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        { msg: "Token verification error", courseAccess: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { msg: "Internal server error", courseAccess: false },
      { status: 500 }
    );
  }
}