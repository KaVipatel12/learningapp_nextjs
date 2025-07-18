import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IPurchaseCourse, User } from "@/models/models";
import { connect } from "@/db/dbConfig";
import { Types } from "mongoose";

interface CustomJwtPayload extends JwtPayload {
  email: string;
  id: string;
  role: string;
}

export interface CourseAccessContext {
  user?: InstanceType<typeof User>;
  courseAccess: boolean;
  courseModify: boolean;
}

export async function courseAccessMiddleware(
  req: NextRequest,
  courseId: string
): Promise<CourseAccessContext | NextResponse> {
  try {
    await connect();

    // Extract token
    const token = req.cookies.get("token")?.value;
    if (!token) return unauthorizedResponse("Token not provided");

    // Verify token
    const decoded = jwt.verify(
      token.replace("Bearer", "").trim(),
      process.env.JWT_SECRET!
    ) as CustomJwtPayload;

    if (!decoded?.email) return unauthorizedResponse("Invalid token payload");

    // Get user from DB
    const user = await User.findOne({ email: decoded.email });
    if (!user) return unauthorizedResponse("User not found");

    // Educator: can access & modify course if they created it
    if (user.role === "educator") {
      const isOwner = user.courses?.some(
        (course: Types.ObjectId) => course.toString() === courseId
      );
      if (isOwner) {
        return {
          user,
          courseAccess: true,
          courseModify: true,
        };
      }
    }

    // Student: check if course is purchased
    const hasPurchased = user.purchaseCourse?.some((purchase: IPurchaseCourse) => {
      const purchasedId =
        purchase.courseId instanceof Types.ObjectId
          ? purchase.courseId.toString()
          : purchase.courseId;
      return purchasedId === courseId;
    });

    if (hasPurchased) {
      return {
        user,
        courseAccess: true,
        courseModify: false,
      };
    }

    return unauthorizedResponse("Course not purchased");
  } catch (error) {
    console.error("Error in courseAccessMiddleware:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return unauthorizedResponse("Invalid token");
    }
    return serverErrorResponse();
  }
}

// Helpers
function unauthorizedResponse(message: string): NextResponse {
  return NextResponse.json({ message, courseAccess: false }, { status: 401 });
}

function serverErrorResponse(): NextResponse {
  return NextResponse.json(
    { message: "Internal server error", courseAccess: false },
    { status: 500 }
  );
}
