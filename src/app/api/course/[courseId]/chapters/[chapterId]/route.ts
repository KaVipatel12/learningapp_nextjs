import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db/dbConfig';
import { Chapter } from '@/models/models';
import { CourseAccessContext, courseAccessMiddleware } from '@/app/middleware/courseAccessMiddleware';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ chapterId: string; courseId: string }> }
) {

  await connect(); 

  console.log("Reached")
  const {chapterId, courseId} = await props.params; 
  const accessCourse = await courseAccessMiddleware(req, courseId);

    if (accessCourse instanceof NextResponse) {
      return accessCourse;
    }

  const {courseModify , courseAccess } = accessCourse as CourseAccessContext;
  console.log(chapterId)

  try{
    const chapters = await Chapter.findById(chapterId)
    .populate({
    path: "courseId",
    model: "Course",
    select : "educatorName totalEnrollment"
  });

      if(!chapters){
        return NextResponse.json({msg : "Chapters not found"}, {status : 404})
      }

      return NextResponse.json({msg : chapters ,  courseAccess , courseModify}, {status : 200})
    }catch(err) {
      console.log(err)
      return NextResponse.json({msg : "Internal servor error", courseAccess , courseModify} , {status : 500})
    }
}