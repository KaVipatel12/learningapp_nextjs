import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/middleware/courseModifyMiddleware';
import { Chapter, Course } from '@/models/models';
import cloudinary from '@/utils/cloudinary/cloudinary';
import mongoose from 'mongoose';

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  await connect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseId } = await params;
    
    // 1. Verify course ownership
    const modifyResult = await courseModifyMiddleware(req, courseId);
    if (modifyResult instanceof NextResponse) {
      return modifyResult;
    }

    // 2. Find the course and its chapters
    const course = await Course.findById(courseId).session(session);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    const chapters = await Chapter.find({ courseId }).session(session);
    
    // 3. Collect all resources to delete
    const resourcesToDelete = [];
    
    // Add course thumbnail if exists
    if (course.imagePublicId) {
      resourcesToDelete.push({
        type: 'image',
        publicId: course.imagePublicId,
        source: 'course thumbnail'
      });
    }

    // Add all chapter videos
    for (const chapter of chapters) {
      for (const video of chapter.videos) {
        if (video.videoPublicId) {
          resourcesToDelete.push({
            type: 'video',
            publicId: video.videoPublicId,
            source: `chapter ${chapter._id} video ${video._id}`
          });
        }
      }
    }

    console.log('Resources to delete:', resourcesToDelete);

    // 4. Delete from Cloudinary (continue even if some fail)
    const deletionPromises = resourcesToDelete.map(async ({ type, publicId, source }) => {
      try {
        const result = await cloudinary.uploader.destroy(publicId, { 
          resource_type: type,
          invalidate: true
        });
        
        return { 
          success: result.result === 'ok', 
          publicId, 
          source,
          result: result.result
        };
      } catch (error) {
        console.error(`Failed to delete ${source}:`, error);
        return { 
          success: false, 
          publicId, 
          source,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const deletionResults = await Promise.allSettled(deletionPromises);
    const failedDeletions = deletionResults
      .filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
      .map(result => {
        if (result.status === 'rejected') {
          return { reason: result.reason };
        } else {
          return result.value;
        }
      });

    // Log any failed deletions but continue with database cleanup
    if (failedDeletions.length > 0) {
      console.warn('Some resources failed to delete from Cloudinary:', failedDeletions);
    }
    
    // 5. Delete database records regardless of Cloudinary results
    await Chapter.deleteMany({ courseId }).session(session);
    await Course.findByIdAndDelete(courseId).session(session);
    
    // 6. Commit transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: 'Course and all associated resources deleted successfully',
      deletedResources: resourcesToDelete.length - failedDeletions.length,
      failedResources: failedDeletions.length,
      deletedChapters: chapters.length
    });

  } catch (error: unknown) {
    // 7. Abort transaction on any error
    await session.abortTransaction();
    
    console.error('Course deletion failed:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete course and associated resources',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}