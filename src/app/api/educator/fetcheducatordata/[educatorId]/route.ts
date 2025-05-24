import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/db/dbConfig';
import { Educator } from '@/models/models';


export async function GET(req : NextRequest, {params} : {params : {educatorId: string}}){

  await connect(); 

  const { educatorId } = await params; 

  if(!educatorId){
    return NextResponse.json({msg : "No educator found", isParams : false}, {status : 404})
  }
  try {      
    const educatorData = await Educator.findById(educatorId).populate('courses');
    if (!educatorData){
      return NextResponse.json({ msg: "No educator found" }, {status : 404});
    }
    
    return NextResponse.json({ msg: educatorData }, {status : 200});
  } catch (error : unknown) {
    console.log(error)
   return NextResponse.json({ msg: "Server error", error: error}, {status : 500});
  }
}