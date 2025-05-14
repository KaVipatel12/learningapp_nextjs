// app/api/courses/route.ts
import { connect } from '@/db/dbConfig';
import { Course } from '@/models/models';
import { NextResponse } from 'next/server';

interface QueryParams {
  page?: string;
  limit?: string;
  courseName?: string;
  educatorName?: string;
  category?: string;
  price?: string;
}

// Define a type for our query filters
interface CourseQueryFilters {
  title?: RegExp;
  educatorName?: RegExp;
  category?: RegExp;
  price?: { $lte: number };
}

export async function GET(request: Request) {
  try {
    await connect();
    console.log("Fetching course")
    const { searchParams } = new URL(request.url);
    const params: QueryParams = Object.fromEntries(searchParams.entries());

    // Parse query parameters with defaults
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '4');
    const skip = (page - 1) * limit;

    // Build the typed query object
    const query: CourseQueryFilters = {};

    if (params.courseName) {
      query.title = new RegExp(params.courseName, 'i');
    }
    if (params.educatorName) {
      query.educatorName = new RegExp(params.educatorName, 'i');
    }
    if (params.category) {
      query.category = new RegExp(params.category, 'i');
      }
    if (params.price) {
      query.price = { $lte: parseInt(params.price) };
    }

    // Promise.all for parallel execution
    const [totalCourses, courseData] = await Promise.all([
      Course.countDocuments(query),
      Course.find(query)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    if (!courseData.length) {
      return NextResponse.json(
        { msg: "No courses found", totalCourses: 0, currentPage: page },
        { status: 404 }
      );
    }

    return NextResponse.json({
      msg: courseData,
      totalCourses,
      currentPage: page
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { msg: "Server error", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}