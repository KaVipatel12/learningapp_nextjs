import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/middleware/courseModifyMiddleware';
import { Chapter, Course } from '@/models/courseModel';
import cloudinary from '@/utils/cloudinary/cloudinary';

interface VideoInput {
  title: string;
  duration?: number;
}

interface UploadedVideo extends VideoInput {
  videoUrl: string;
  videoPublicId: string;
}

interface ChapterInput {
  title: string;
  description: string;
  videos: VideoInput[];
}

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  await connect();

  // Verify educator can modify this course
  const modifyResult = await courseModifyMiddleware(req, params);
  if (modifyResult instanceof NextResponse) {
    return modifyResult;
  }

  try {
    const formData = await req.formData();
    const chaptersData = formData.get('chapters');
    
    // Parse and validate chapters data
    if (!chaptersData || typeof chaptersData !== 'string') {
      return NextResponse.json(
        { msg: "Invalid chapters data format" },
        { status: 400 }
      );
    }

    let chapters: ChapterInput[];
    try {
      chapters = JSON.parse(chaptersData) as ChapterInput[];
    } catch {
      return NextResponse.json(
        { msg: "Invalid chapters JSON format" },
        { status: 400 }
      );
    }

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { msg: "No chapters provided or invalid format" },
        { status: 400 }
      );
    }

    // Process each chapter and its videos
    const createdChapters = await Promise.all(chapters.map(async (chapter, chapterIndex) => {
      // Upload videos to Cloudinary
      const uploadedVideos: UploadedVideo[] = await Promise.all(
        chapter.videos.map(async (video, videoIndex) => {
          const videoFile = formData.get(`chapter-${chapterIndex}-video-${videoIndex}`) as File | null;
          if (!videoFile) {
            throw new Error(`Video file not found for chapter ${chapterIndex} video ${videoIndex}`);
          }

          // Upload to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(await videoFile.text(), {
            folder: `courses/${params.courseId}/videos`,
            resource_type: 'video'
          });

          return {
            title: video.title,
            videoUrl: uploadResult.secure_url,
            videoPublicId: uploadResult.public_id,
            duration: video.duration || 0
          };
        })
      );

      // Calculate chapter duration (sum of video durations)
      const chapterDuration = uploadedVideos.reduce((sum, video) => sum + (video.duration || 0), 0);

      // Create chapter
      return await Chapter.create({
        title: chapter.title,
        description: chapter.description,
        duration: chapterDuration,
        videos: uploadedVideos,
        courseId: params.courseId
      });
    }));

    // Update course with new chapters
    const updatedCourse = await Course.findByIdAndUpdate(
      params.courseId,
      {
        $push: { chapters: { $each: createdChapters.map(ch => ch._id) } },
        $inc: {
          totalSections: createdChapters.length,
          totalLectures: createdChapters.reduce((sum, ch) => sum + ch.videos.length, 0),
          duration: createdChapters.reduce((sum, ch) => sum + (ch.duration || 0), 0)
        }
      },
      { new: true }
    ).populate('chapters');

    if (!updatedCourse) {
      // Cleanup: Delete any uploaded videos if course update fails
      await Promise.all(
        createdChapters.flatMap(chapter => 
          chapter.videos.map(async (video: UploadedVideo) => {
            if (video.videoPublicId) {
              await cloudinary.uploader.destroy(video.videoPublicId, {
                resource_type: 'video'
              });
            }
          })
        )
      );
      
      return NextResponse.json(
        { msg: "Failed to update course with new chapters" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        msg: "Chapters added successfully",
        course: updatedCourse,
        chapters: createdChapters
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Error adding chapters:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        msg: "Internal server error",
        error: errorMessage
      },
      { status: 500 }
    );
  }
}