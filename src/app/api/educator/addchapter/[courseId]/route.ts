import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/app/middleware/courseModifyMiddleware';
import { Chapter, Course } from '@/models/models';
import cloudinary from '@/utils/cloudinary/cloudinary';

interface VideoInput {
  title: string;
  duration?: number;
}

interface UploadedVideo {
  title: string;
  videoUrl: string;
  videoPublicId: string;
  duration: number;
}

// Define a more specific interface for chapters without using 'any'
interface ChapterWithVideos {
  _id?: string;
  title?: string;
  description?: string;
  duration?: number;
  videos?: UploadedVideo[];
  courseId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  bytes?: number;
}

interface ChapterInput {
  title: string;
  description: string;
  videos: VideoInput[];
}

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  await connect();
  
  const {courseId} = await params
  // Correctly pass just the courseId to the middleware
  const modifyResult = await courseModifyMiddleware(req, courseId);
  if (modifyResult instanceof NextResponse) {
    return modifyResult;
  }

  try {
    const formData = await req.formData();
    const chaptersData = formData.get('chapters');
    
    // Validate chapters data
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
    const createdChapters = [];
    
    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
      const chapter = chapters[chapterIndex];
      
      try {
        // Validate required chapter fields
        if (!chapter.title || !chapter.description) {
          throw new Error(`Chapter ${chapterIndex} is missing required fields (title or description)`);
        }
        
        // Upload videos to Cloudinary
        const uploadedVideos: UploadedVideo[] = [];
        
        for (let videoIndex = 0; videoIndex < chapter.videos.length; videoIndex++) {
          const video = chapter.videos[videoIndex];
          
          if (!video.title) {
            throw new Error(`Video ${videoIndex} in chapter ${chapterIndex} is missing a title`);
          }
          
          const videoFile = formData.get(`chapter-${chapterIndex}-video-${videoIndex}`) as File | null;
          if (!videoFile) {
            throw new Error(`Video file not found for chapter ${chapterIndex} video ${videoIndex}`);
          }

          // Validate file size (5MB limit)
          if (videoFile.size > 50 * 1024 * 1024) {
            throw new Error(`Video file exceeds 5MB limit`);
          }

          // Convert File to buffer for Cloudinary upload
          const arrayBuffer = await videoFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          function isCloudinaryUploadResult(result: unknown): result is CloudinaryUploadResult {
            return (
              typeof result === 'object' && 
              result !== null &&
              'secure_url' in result && 
              'public_id' in result
            );
          }
          
          // Upload to Cloudinary
          const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `courses/${courseId}/videos`,
                resource_type: 'video'
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else if (!result || !isCloudinaryUploadResult(result)) {
                  reject(new Error('Invalid Cloudinary response'));
                } else {
                  resolve(result);
                }
              }
            );
            uploadStream.end(buffer);
          });

          uploadedVideos.push({
            title: video.title,
            videoUrl: uploadResult.secure_url,
            videoPublicId: uploadResult.public_id,
            duration: video.duration || 0
          });
        }

        // Calculate chapter duration
        const chapterDuration = uploadedVideos.reduce(
          (sum, video) => sum + (video.duration || 0), 
          0
        );

        // Create chapter
        const newChapter = await Chapter.create({
          title: chapter.title,
          description: chapter.description,
          duration: chapterDuration,
          videos: uploadedVideos,
          courseId: courseId
        });
        
        createdChapters.push(newChapter);
      } catch (chapterError) {
        // Clean up any videos that were uploaded for this chapter before the error
        await cleanupUploadedVideos(createdChapters);
        
        console.error(`Error processing chapter ${chapterIndex}:`, chapterError);
        return NextResponse.json(
          { 
            msg: `Error processing chapter ${chapterIndex}`,
            error: chapterError instanceof Error ? chapterError.message : 'Unknown error'
          },
          { status: 400 }
        );
      }
    }

    // Update course with new chapters
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
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
      // Cleanup uploaded videos if course update fails
      await cleanupUploadedVideos(createdChapters);
      
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

// Helper function to clean up uploaded videos if something fails
async function cleanupUploadedVideos(chapters: ChapterWithVideos[]) {
  try {
    await Promise.all(
      chapters.flatMap(chapter => 
        (chapter.videos || []).map(async (video: UploadedVideo) => {
          if (video.videoPublicId) {
            await cloudinary.uploader.destroy(video.videoPublicId, {
              resource_type: 'video'
            });
          }
        })
      )
    );
  } catch (cleanupError) {
    console.error('Error cleaning up videos:', cleanupError);
  }
}