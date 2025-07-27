// app/api/quiz/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Report, Notification } from '@/models/models';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { connect } from '@/db/dbConfig';
import mongoose from 'mongoose';

export async function PATCH(req: NextRequest) {
  try {
    await connect();

    const authResult = await authUserMiddleware(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult as AuthContext;

    if (!user) {
      return NextResponse.json(
        { msg: "Authentication failed" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can perform this action" },
        { status: 401 }
      );
    }

    const { reportId, status } = await req.json(); //  also get 'status' from request

    const report = await Report.findById(reportId)
      .populate('userId', 'username')
      .populate('commentId', 'comment')
      .populate('courseId', 'title')
      .populate('chapterId', 'title')
      .exec();

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    // Determine if it's a warning
    const isWarning = status === "warn";

    // Prepare notification
    let notificationMessage = '';
    const notificationData = {
      userId: report.userId._id,
      message: ''
    };

    if (report.commentId) {
      const commentPreview = report.commentId.comment?.substring(0, 50);
      notificationMessage = isWarning
        ? `⚠️ Warning: Your comment "${commentPreview}${report.commentId.comment?.length > 50 ? '...' : ''}" violates our community guidelines.`
        : `Your comment "${commentPreview}${report.commentId.comment?.length > 50 ? '...' : ''}" has been removed for violating our community guidelines.`;

      notificationData.commentId = report.commentId._id;
      notificationData.chapterId = report.chapterId?._id;
      notificationData.courseId = report.courseId._id;
    } else if (report.chapterId) {
      const chapterTitle = report.chapterId.title;
      const courseTitle = report.courseId.title;

      notificationMessage = isWarning
        ? `⚠️ Warning: Your chapter "${chapterTitle}" in course "${courseTitle}" violates our community guidelines.`
        : `Your chapter "${chapterTitle}" in course "${courseTitle}" has been restricted for violating our community guidelines.`;

      notificationData.chapterId = report.chapterId._id;
      notificationData.courseId = report.courseId._id;
    } else if (report.courseId) {
      const courseTitle = report.courseId.title;

      notificationMessage = isWarning
        ? `⚠️ Warning: Your course "${courseTitle}" violates our community guidelines.`
        : `Your course "${courseTitle}" has been restricted for violating our community guidelines.`;

      notificationData.courseId = report.courseId._id;
    }

    // Add the reason if available
    if (report.description) {
      notificationMessage += ` Reason: ${report.description}`;
    }

    notificationData.message = notificationMessage;

    //  Begin transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the report
      await Report.findByIdAndDelete(reportId).session(session);

      // Create notification
      const notify = await Notification.create([notificationData], { session });

      console.log(notify)
      await session.commitTransaction();

      return NextResponse.json(
        {
          message: isWarning
            ? 'Warning notification sent and report deleted successfully'
            : 'Report deleted and notification sent successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error in report action:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
