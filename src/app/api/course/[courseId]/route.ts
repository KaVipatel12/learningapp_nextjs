import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db/dbConfig';
import { Course } from '@/models/models';


export async function GET(
  req: NextRequest,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params;

  await connect(); 
  if(!courseId){
    return NextResponse.json({msg : "Wrong url", isParams : false}, {status : 404})
  }
  try {      
    const courseData = await Course.findById(courseId).populate('educator');
    if (!courseData){
      return NextResponse.json({ msg: "No courses found" }, {status : 404});
    }
    
    return NextResponse.json({ msg: courseData }, {status : 200});
  } catch (error : unknown) {
   return NextResponse.json({ msg: "Server error", error: error}, {status : 500});
  }
}