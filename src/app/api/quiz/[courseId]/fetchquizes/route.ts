import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/db/dbConfig';
import { CourseQuiz } from '@/models/models';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ courseId: string }> }
) {
  await connect();

  const { courseId } = await props.params;
  try {

    const quizes = await CourseQuiz.find({
      courseId 
    }, "title");
    return NextResponse.json(
      { message: "Quiz fetched successfully", quiz: quizes},
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
