import { connect } from '@/db/dbConfig';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import {Course} from '@/models/models';
import {User} from '@/models/models';
import { uploadFile } from '@/utils/cloudinary/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await connect();

  // Authenticate educator
  const authResult = await authUserMiddleware(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult as AuthContext;
  const educatorId = user?._id;

  try {
    const formData = await req.formData();
    
    // Extract all fields exactly as they come from frontend
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = Number(formData.get('price'));
    const duration = Number(formData.get('duration'));
    const level = formData.get('level') as string;
    const language = formData.get('language') as string;
    const prerequisites = formData.get('prerequisites') as string;
    const learningOutcomes = formData.get('learningOutcomes') as string;
    const certification = formData.get('certification') === 'true';
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const discount = Number(formData.get('discount')) || 0;
    const totalSections = Number(formData.get('totalSections')) || 0;
    const totalLectures = Number(formData.get('totalLectures')) || 0;
    const totalQuizzes = Number(formData.get('totalQuizzes')) || 0;
    const welcomeMessage = formData.get('welcomeMessage') as string;
    const completionMessage = formData.get('completionMessage') as string;

    // Handle file upload
    const file = formData.get('imageUrl') as File | null;
    let imageUrl = undefined;
    if (file) {
      const cloudinaryResult = await uploadFile(file, 'courses');
      imageUrl = cloudinaryResult.secure_url;
    }

    // Create course with exact frontend fields
    const newCourse = await Course.create({
      title,
      description,
      category,
      price,
      duration,
      level,
      language,
      prerequisites,
      learningOutcomes,
      certification,
      startDate,
      endDate,
      discount,
      totalSections,
      totalLectures,
      totalQuizzes,
      welcomeMessage,
      completionMessage,
      imageUrl,
      educator: educatorId,
      educatorName: user?.username // Using educator's username as instructor name
    });

    // Update educator's courses
    await User.findByIdAndUpdate(
      educatorId,
      { $push: { courses: newCourse._id } }
    );

    return NextResponse.json(
      { 
        msg: "Course created successfully",
        course: newCourse
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        msg: "Failed to create course",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}