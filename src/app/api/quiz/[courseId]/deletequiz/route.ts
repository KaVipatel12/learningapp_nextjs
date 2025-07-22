import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/app/middleware/courseModifyMiddleware';
import { CourseQuiz } from '@/models/models';

  export async function DELETE(req: NextRequest) {
    await connect();
    
    try {
      const { quizIds , courseId } = await req.json();
      
      if (!quizIds) {
        return NextResponse.json(
          { success: false, message: 'Invalid request data' },
          { status: 400 }
        );
      }
  
      const modifyResult = await courseModifyMiddleware(req, courseId);
      if (modifyResult instanceof NextResponse) {
        return modifyResult;
      }
  
       const deleteResult = await CourseQuiz.deleteMany({
        _id: { $in: quizIds },
        courseId
      });

  
      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          { success: false, message: 'Failed to delete quizes' },
          { status: 500 }
        );
      }
  
      return NextResponse.json({
        success: true,
        message: 'Quizes deleted successfully',
        deletedQuizes: deleteResult.deletedCount,
      });
  
    } catch (error: unknown) {
      console.error('Error in DELETE route:', error);
      return NextResponse.json(
        { 
          success: false,
          message: 'Failed to delete chapters',
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        { status: 500 }
      );
    }
  }