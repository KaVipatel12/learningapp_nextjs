// app/api/quiz/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Notification, User } from '@/models/models';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { connect } from '@/db/dbConfig';

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
        {
          message: "Only admin can perform this action"
        },
        { status: 401 }
      );
    }

    const { userId, status , type  } = await req.json();

    let message = '';

    if (type === "warn") {
      // Send only warning notification
      message = "⚠️ Warning: Your account activity is against our community guidelines. Repeated violations may result in restriction.";
      await Notification.create({ userId, message });
      const inc = await User.findByIdAndUpdate(userId , { $inc : { warnings : 1 }}, {new : true})
      return NextResponse.json(
        {
          message: "Warning notification sent successfully"
        },
        { status: 200 }
      );
    }

    // Update restriction status
    const updateStatus = await User.findByIdAndUpdate(
      userId,
      { restriction: status },
      { new: true }
    );

    if (!updateStatus) {
      return NextResponse.json(
        {
          message: "Something went wrong"
        },
        { status: 400 }
      );
    }

    // Send notification for restriction or recovery
    message =
      status === 0
        ? "✅ Your account has been recovered. Please follow the guidelines to avoid future restrictions."
        : "🚫 Your account has been restricted due to repeated violations of our guidelines.";

    const notify = await Notification.create({ userId, message });

    return NextResponse.json(
      {
        message: "User status updated and notification sent successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in updating:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
