import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/middleware/courseModifyMiddleware';
import { Chapter } from '@/models/models';
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

interface ChapterInput {
  title: string;
  description: string;
  videos: VideoInput[];
}

interface ProcessedVideo {
    title: string;
    duration: number;
    videoUrl: string;
    videoPublicId: string;
  }
  
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

export async function PUT(req: NextRequest, { params }: { params: { courseId: string, chapterId: string } }) {
  await connect();
  
  const { courseId, chapterId } = await params;
  
  // Verify course ownership
  const modifyResult = await courseModifyMiddleware(req, courseId);
  if (modifyResult instanceof NextResponse) {
    return modifyResult;
  }

  try {
    const formData = await req.formData();
    const chapterData = formData.get('chapter');
    
    // Validate chapter data
    if (!chapterData || typeof chapterData !== 'string') {
      return NextResponse.json(
        { msg: "Invalid chapter data format" },
        { status: 400 }
      );
    }

    let chapterInput: ChapterInput;
    try {
      chapterInput = JSON.parse(chapterData) as ChapterInput;
    } catch {
      return NextResponse.json(
        { msg: "Invalid chapter JSON format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!chapterInput.title || !chapterInput.description) {
      return NextResponse.json(
        { msg: "Chapter title and description are required" },
        { status: 400 }
      );
    }

    if (!chapterInput.videos || chapterInput.videos.length === 0) {
      return NextResponse.json(
        { msg: "At least one video is required" },
        { status: 400 }
      );
    }

    // Get existing chapter to track changes
    const existingChapter = await Chapter.findOne({ _id: chapterId, courseId });
    if (!existingChapter) {
      return NextResponse.json(
        { msg: "Chapter not found" },
        { status: 404 }
      );
    }

// Process videos
const updatedVideos: ProcessedVideo[] = [];
const videosToDelete: string[] = [];

for (let i = 0; i < chapterInput.videos.length; i++) {
  const video = chapterInput.videos[i];
  
  if (!video.title) {
    return NextResponse.json(
      { msg: `Video ${i} is missing a title` },
      { status: 400 }
    );
  }

  // Check if video exists in the database
  const existingVideo = existingChapter.videos.find((v : VideoInput) => v._id.toString() === video.id);
  
  if (existingVideo) {
    // Existing video - check if new file was uploaded
    const videoFile = formData.get(`video-${i}`) as File | null;
    
    if (videoFile) {
      // Upload new video to replace existing one
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // First delete old video from Cloudinary
      await cloudinary.uploader.destroy(existingVideo.videoPublicId, {
        resource_type: 'video'
      });

      // Upload new video
      const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `courses/${courseId}/videos`,
            resource_type: 'video'
          },
          (error, result) => {
            if (error) reject(error);
            else if (!result) reject(new Error('Upload failed'));
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      updatedVideos.push({
        title: video.title,
        duration: video.duration,
        videoUrl: uploadResult.secure_url,
        videoPublicId: uploadResult.public_id
      });
    } else {
      // Keep existing video with updated metadata
      updatedVideos.push({
        title: video.title,
        duration: video.duration,
        videoUrl: existingVideo.videoUrl,
        videoPublicId: existingVideo.videoPublicId
      });
    }
  } else {
    // New video - upload to Cloudinary
    const videoFile = formData.get(`video-${i}`) as File | null;
    if (!videoFile) {
      return NextResponse.json(
        { msg: `Video file not found for video ${i}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `courses/${courseId}/videos`,
          resource_type: 'video'
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error('Upload failed'));
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    updatedVideos.push({
      title: video.title,
      duration: video.duration,
      videoUrl: uploadResult.secure_url,
      videoPublicId: uploadResult.public_id
    });
  }
}

// Identify videos to delete (existing videos not in the updated list)
for (const existingVideo of existingChapter.videos) {
  if (!chapterInput.videos.some(v => v.id === existingVideo._id.toString())) {
    videosToDelete.push(existingVideo.videoPublicId);
  }
}

    // Delete removed videos from Cloudinary
    await Promise.all(
      videosToDelete.map(publicId => 
        cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
      )
    );

    // Calculate new chapter duration
    const newDuration = updatedVideos.reduce(
      (sum, video) => sum + (video.duration || 0), 
      0
    );

    // Update chapter in database
    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      {
        title: chapterInput.title,
        description: chapterInput.description,
        duration: newDuration,
        videos: updatedVideos
      },
      { new: true }
    );

    if (!updatedChapter) {
      return NextResponse.json(
        { msg: "Failed to update chapter" },
        { status: 500 }
      );
    }

    console.log(updatedChapter)
    return NextResponse.json(
      {
        msg: "Chapter updated successfully",
        chapter: updatedChapter
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error updating chapter:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        msg: "Failed to update chapter",
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}