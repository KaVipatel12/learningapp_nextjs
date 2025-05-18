import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Educator, User } from "@/models/models";
import { connect } from "@/db/dbConfig";
import { Types } from "mongoose";

interface CustomJwtPayload extends JwtPayload {
  email: string;
  id: string;
  role: string;
}

export interface CourseAccessContext {
  user?: InstanceType<typeof Educator> | InstanceType<typeof User>;
  courseAccess: boolean;
  courseModify: boolean;
}

export async function courseAccessMiddleware(
  req: NextRequest,
  courseId: string
): Promise<CourseAccessContext | NextResponse> {
  try {
    await connect();
    
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return unauthorizedResponse("Token not provided");
    }

    const jwtToken = token.replace('Bearer', "").trim();
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as CustomJwtPayload;

    if (!decoded.email) {
      return unauthorizedResponse("Invalid token payload");
    }

    const [educatorData, userData] = await Promise.all([
      Educator.findOne({ email: decoded.email }),
      User.findOne({ email: decoded.email })
    ]);

    if (!educatorData && !userData) {
      return unauthorizedResponse("User not found");
    }

    // Check educator access
    if (educatorData && educatorData.role === "educator") {
      const hasAccess = educatorData.courses.some((course: Types.ObjectId) => 
        course.toString() === courseId
      );
      
      if (hasAccess) {
        return {
          user: educatorData,
          courseAccess: true,
          courseModify: true
        };
      }
      return unauthorizedResponse("Unauthorized educator access");
    }

    // Check user access
    if (userData) {
      const hasPurchased = userData.purchaseCourse.some(
        (purchase: { courseId: Types.ObjectId | string }) => {
          const purchaseCourseId = purchase.courseId instanceof Types.ObjectId 
            ? purchase.courseId.toString() 
            : purchase.courseId;
          return purchaseCourseId === courseId;
        }
      );
      
      if (hasPurchased) {
        return {
          user: userData,
          courseAccess: true,
          courseModify: false
        };
      }
      return unauthorizedResponse("Course not purchased");
    }

    return unauthorizedResponse("Unauthorized access");

  } catch (error) {
    console.error("Error in courseAccessMiddleware:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return unauthorizedResponse("Invalid token");
    }
    return serverErrorResponse();
  }
}

// Helper functions
function unauthorizedResponse(message: string): NextResponse {
  return NextResponse.json(
    { message, courseAccess: false },
    { status: 401 }
  );
}

function serverErrorResponse(): NextResponse {
  return NextResponse.json(
    { message: "Internal server error", courseAccess: false },
    { status: 500 }
  );
}