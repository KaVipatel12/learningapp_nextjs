import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connect } from "@/db/dbConfig";
import Educator, { IEducator } from "@/models/educatorModel";

// Extend JwtPayload to include your custom fields
export interface CustomJwtPayload extends JwtPayload {
  email: string;
  id: string;
  role: string;
}

// Define a context type that will be used to pass data between middleware and route handlers
export interface AuthContext {
  educator? : IEducator
  isAuthenticated: boolean;
}

/**
 * Authentication middleware for Next.js App Router
 * @param req The Next.js request object
 * @returns Either an error response or the authenticated user data
 */
export async function authEducatorMiddleware(
  req: NextRequest
): Promise<AuthContext | NextResponse> {
  try {
    await connect();
    
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Please login to proceed further" },
        { status: 401 }
      );
    }

    const jwtToken = token.replace("Bearer", "").trim();

    try {
      const decoded = jwt.verify(
        jwtToken,
        process.env.JWT_SECRET as string
      ) as CustomJwtPayload;

      if (!decoded.email) {
        return NextResponse.json(
          { msg: "Invalid token payload" },
          { status: 403 }
        );
      }

      const educatorData = await Educator.findOne({ email: decoded.email });

      if (!educatorData) {
        return NextResponse.json({ msg: "Educator not found" }, { status: 404 });
      }

      // Return the user data for use in the route handler
      return {
        educator: educatorData,
        isAuthenticated: true
      };
    } catch (error) {
      console.error("Auth middleware error:", error);
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