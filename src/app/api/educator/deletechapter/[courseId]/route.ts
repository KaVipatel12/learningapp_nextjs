import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/app/middleware/courseModifyMiddleware';
import { Chapter, Course } from '@/models/models';
import cloudinary from '@/utils/cloudinary/cloudinary';
import { Types } from 'mongoose';



interface VideoInput {
    id?: string;
    _id: Types.ObjectId | string;
    title: string;
    duration: number;
    videoUrl?: string;
    videoPublicId?: string;
  }


  export async function DELETE(req: NextRequest) {
    await connect();
    
    try {
      const { courseId, chapterIds } = await req.json();
      
      if (!courseId || !chapterIds || !Array.isArray(chapterIds)) {
        return NextResponse.json(
          { success: false, message: 'Invalid request data' },
          { status: 400 }
        );
      }
  
      const modifyResult = await courseModifyMiddleware(req, courseId);
      if (modifyResult instanceof NextResponse) {
        return modifyResult;
      }
  
      const chaptersToDelete = await Chapter.find({
        _id: { $in: chapterIds },
        courseId
      }).lean();
  
      if (!chaptersToDelete.length) {
        return NextResponse.json(
          { success: false, message: 'No chapters found to delete' },
          { status: 404 }
        );
      }
  
      const videoPublicIds: string[] = [];
      chaptersToDelete.forEach(chapter => {
        chapter.videos.forEach((video: VideoInput) => {
          if (video.videoPublicId && typeof video.videoPublicId === 'string') {
            videoPublicIds.push(video.videoPublicId);
          }
        });
      });
  
      console.log('Videos to delete from Cloudinary:', videoPublicIds);
  
      const cloudinaryDeletions = await Promise.allSettled(
        videoPublicIds.map(publicId => 
          cloudinary.uploader.destroy(publicId, { 
            resource_type: 'video',
            invalidate: true // Clear CDN cache
          })
        )
      );
  
      cloudinaryDeletions.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `Failed to delete video ${videoPublicIds[index]}:`, 
            result.reason
          );
        }
      });
  
      const deleteResult = await Chapter.deleteMany({
        _id: { $in: chapterIds },
        courseId
      });
  
      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          { success: false, message: 'Failed to delete chapters' },
          { status: 500 }
        );
      }
  
      const totalDeletedVideos = videoPublicIds.length;
      await Course.findByIdAndUpdate(courseId, {
        $pull: { chapters: { $in: chapterIds } },
        $inc: {
          totalSections: -deleteResult.deletedCount,
          totalLectures: -totalDeletedVideos
        }
      });
  
      return NextResponse.json({
        success: true,
        message: 'Chapters deleted successfully',
        deletedChapters: deleteResult.deletedCount,
        deletedVideos: totalDeletedVideos,
        cloudinaryResults: cloudinaryDeletions.map((r, i) => ({
          publicId: videoPublicIds[i],
          status: r.status,
          ...(r.status === 'rejected' ? { error: r.reason.message } : {})
        }))
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