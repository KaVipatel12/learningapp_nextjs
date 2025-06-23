  import { NextRequest, NextResponse } from 'next/server';
  import { connect } from '@/db/dbConfig';
  import { Chapter } from '@/models/models';
  
  
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params;
  
    await connect(); 
    console.log(courseId)

    if(!courseId){
      return NextResponse.json({msg : "Wrong url", isParams : false}, {status : 404})
    }
    try {      
        const chapters = await Chapter.find({courseId}, "title courseId description videos.duration _id")
      if (!chapters){
        return NextResponse.json({ msg: "No chapters found" }, {status : 404});
      }
  
      return NextResponse.json({ msg: chapters }, {status : 200});
    } catch (error : unknown) {
      console.log(error)
     return NextResponse.json({ msg: "Server error", error: error}, {status : 500});
    }
  }