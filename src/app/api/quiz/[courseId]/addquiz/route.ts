import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/db/dbConfig';
import { courseModifyMiddleware } from '@/app/middleware/courseModifyMiddleware';
import { CourseQuiz } from '@/models/models';


export async function POST(
  req: NextRequest,
  props: { params: Promise<{ courseId: string }> }
) {
  await connect();

  const { courseId } = await props.params;

  const modifyResult = await courseModifyMiddleware(req, courseId);
  if (modifyResult instanceof NextResponse) {
    return modifyResult;
  }

  try {
    const { title, questions } = await req.json();

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const newQuiz = await CourseQuiz.create({
      courseId,
      title,
      questions,
    });

    return NextResponse.json(
      { message: "Quiz created successfully", quiz: newQuiz },
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
