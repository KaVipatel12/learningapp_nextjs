import { NextResponse } from "next/server";
import { connect } from "@/db/dbConfig";
import { User } from "@/models/models";

export async function GET() {
  try {
    await connect();
    
    try {
      const fetchUsers = await User.find({});
      
      // Filter users by role instead of mapping to booleans
      const educators = fetchUsers.filter(user => user.role === "educator");
      const students = fetchUsers.filter(user => user.role === "student" && user.restriction !== 1);
      const restrictedUsers = fetchUsers.filter(user => user.restriction === 1);

      if (!educators.length && !students.length) {
        return NextResponse.json(
          { msg: "No users found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        educators, 
        students, 
        restrictedUsers 
      }, { status: 200 });
      
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { msg: "Error fetching users", error: errMsg },
        { status: 500 }
      );
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Database connection error:", error);
    return NextResponse.json(
      { msg: "Database connection error", error: errMsg },
      { status: 500 }
    );
  }
}