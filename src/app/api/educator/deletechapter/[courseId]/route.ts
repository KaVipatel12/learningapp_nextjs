import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/middleware/courseModifyMiddleware';
import { Chapter, Course } from '@/models/courseModel';
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
  
  console.log("Delete chapter")
  try {
    const { courseId, chapterIds } = await req.json();
    console.log(courseId , chapterIds)
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

    // Finding the chapters to be deleted
    const chaptersToDelete = await Chapter.find({
      _id: { $in: chapterIds },
      courseId
    });

    if (!chaptersToDelete.length) {
      console.log("NO chapter found to delete")
      return NextResponse.json(
        { success: false, message: 'No chapters found to delete' },
        { status: 404 }
      );
    }

    // Collect all video public IDs for deletion
    const videoPublicIds: string[] = [];
    chaptersToDelete.forEach(chapter => {
      chapter.videos.forEach((video : VideoInput ) => {
        if (video.videoPublicId) {
          videoPublicIds.push(video.videoPublicId);
        }
      });
    });

    // Deleting the videos which are stored in Cloudinary parallelly
    const deletePromises = videoPublicIds.map(publicId => 
      cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
        .catch(error => {
          console.error(`Failed to delete video ${publicId}:`, error);
          return { success: false, publicId };
        })
    );

    const cloudinaryResults = await Promise.all(deletePromises);

    // Deleting the chapters 
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

    // Updating the course by pulling the chapters id from the array and some other updates

    const totalDeletedVideos = videoPublicIds.length;
    await Course.findByIdAndUpdate(courseId, {
      $pull: { chapters: { $in: chapterIds } },
      $inc: {
        totalSections: -deleteResult.deletedCount,
        totalLectures: -totalDeletedVideos,
        // Note: Duration calculation might need adjustment based on your schema
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Chapters deleted successfully',
      deletedCount: deleteResult.deletedCount,
      videosDeleted: totalDeletedVideos,
      cloudinaryResults: cloudinaryResults.filter(r => r.success)
    });

  } catch (error: unknown) {
    console.error('Error deleting chapters:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete chapters',
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}