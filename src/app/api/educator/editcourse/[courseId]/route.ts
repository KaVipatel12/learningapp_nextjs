import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { courseModifyMiddleware } from '@/middleware/courseModifyMiddleware';
import { Course } from '@/models/courseModel';
import cloudinary from '@/utils/cloudinary/cloudinary';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

interface CourseInput {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  totalSections: number;
  totalLectures: number;
  prerequisites?: string;
  learningOutcomes?: string;
  certification?: boolean;
  startDate?: string;
  endDate?: string;
  discount?: number;
  welcomeMessage?: string;
  completionMessage?: string;
}

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  await connect();
  
  const { courseId } = params;
  
  const modifyResult = await courseModifyMiddleware(req, courseId);
  if (modifyResult instanceof NextResponse) {
    return modifyResult;
  }

  try {
    const formData = await req.formData();
    
    // Extract all fields from form data
    const courseInput: CourseInput = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      level: formData.get('level') as string,
      duration: Number(formData.get('duration')),
      totalSections: Number(formData.get('totalSections')),
      totalLectures: Number(formData.get('totalLectures')),
      prerequisites: formData.get('prerequisites') as string,
      learningOutcomes: formData.get('learningOutcomes') as string,
      certification: formData.get('certification') === 'true',
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      discount: Number(formData.get('discount')),
      welcomeMessage: formData.get('welcomeMessage') as string,
      completionMessage: formData.get('completionMessage') as string
    };

    // Check if image was changed (new flag from frontend)
    const imageChanged = formData.get('imageChanged') === 'true';
    console.log('Image changed flag:', imageChanged);

    // Validate required fields
    if (!courseInput.title || !courseInput.description || !courseInput.category) {
      return NextResponse.json(
        { msg: "Title, description and category are required" },
        { status: 400 }
      );
    }

    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return NextResponse.json(
        { msg: "Course not found" },
        { status: 404 }
      );
    }

    // Process image
    let imageUrl = existingCourse.imageUrl;
    let imagePublicId = existingCourse.imagePublicId;
    const imageFile = formData.get('courseImage');
    
    // Only process image if the imageChanged flag is true AND we have a file
    if (imageChanged) {
      // If imageChanged is true but no new file, it means the image was removed
      if (!imageFile) {
        // Handle image removal case
        if (imagePublicId) {
          await cloudinary.uploader.destroy(imagePublicId);
        }
        imageUrl = '';
        imagePublicId = '';
      } 
      // Process new image upload
      else if (typeof imageFile !== 'string' && 'arrayBuffer' in imageFile) {
        try {
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Delete old image if it exists
          if (imagePublicId) {
            await cloudinary.uploader.destroy(imagePublicId);
          }

          // Upload new image
          const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `courses/${courseId}/thumbnail`,
                resource_type: 'image'
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                } else if (!result) {
                  reject(new Error('Upload failed - no result returned'));
                } else {
                  resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id
                  });
                }
              }
            );
            uploadStream.end(buffer);
          });

          imageUrl = uploadResult.secure_url;
          imagePublicId = uploadResult.public_id;
        } catch (error) {
          console.error('Error processing image:', error);
          return NextResponse.json(
            { msg: "Failed to process image upload", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }
      }
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title: courseInput.title,
        description: courseInput.description,
        price: courseInput.price,
        category: courseInput.category,
        level: courseInput.level,
        duration: courseInput.duration,
        totalSections: courseInput.totalSections,
        totalLectures: courseInput.totalLectures,
        prerequisites: courseInput.prerequisites,
        learningOutcomes: courseInput.learningOutcomes,
        certification: courseInput.certification,
        startDate: courseInput.startDate,
        endDate: courseInput.endDate,
        discount: courseInput.discount,
        welcomeMessage: courseInput.welcomeMessage,
        completionMessage: courseInput.completionMessage,
        imageUrl,
        imagePublicId
      },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json(
        { msg: "Failed to update course" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        msg: "Course updated successfully",
        course: updatedCourse,
        courseImage: imageUrl // Return the image URL so frontend can update if needed
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error updating course:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        msg: "Failed to update course",
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}