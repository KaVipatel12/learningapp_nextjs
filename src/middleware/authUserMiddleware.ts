import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import  { User, IUser } from "@/models/models";
import { connect } from "@/db/dbConfig";

// Extend JwtPayload to include your custom fields
export interface CustomJwtPayload extends JwtPayload {
  email: string;
  id: string;
  role: string;
}

// Define a context type that will be used to pass data between middleware and route handlers
export interface AuthContext {
  user?: IUser;
  isAuthenticated: boolean;
}

/**
 * Authentication middleware for Next.js App Router
 * @param req The Next.js request object
 * @returns Either an error response or the authenticated user data
 */
export async function authUserMiddleware(
  req: NextRequest
): Promise<AuthContext | NextResponse> {
  try {
    await connect();
    
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { msg: "Please login to proceed further" },
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

      const userData = await User.findOne({ email: decoded.email });

      if (!userData) {
        return NextResponse.json({ msg: "User not found" }, { status: 404 });
      }

      // Return the user data for use in the route handler
      return {
        user: userData,
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