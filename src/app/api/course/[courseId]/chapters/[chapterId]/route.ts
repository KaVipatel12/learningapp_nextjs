import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db/dbConfig';
import { Chapter } from '@/models/courseModel';

export async function GET(req : NextRequest, {params} : {params : {chapterId: string}}){

  await connect(); 

  console.log("Reached")
  const {chapterId} = await params; 
  console.log(chapterId)

  try{
    const chapters = await Chapter.findById(chapterId)

      if(!chapters){
        return NextResponse.json({msg : "Chapters not found"}, {status : 404})
      }
      return NextResponse.json({msg : chapters}, {status : 200})
    }catch(err) {
      console.log(err)
      return NextResponse.json({msg : "Internal servor error"}, {status : 500})
    }
}