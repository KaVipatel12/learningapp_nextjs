import { connect } from '@/db/dbConfig';
import { AuthContext, authUserMiddleware } from '@/app/middleware/authUserMiddleware';
import { User } from '@/models/models';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  await connect();

  try {
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

    const body = await req.json();
    console.log('Received formData:', body);

    const { username, bio } = body.formData || {};
    
    if (!username || !bio) {
      return NextResponse.json(
        { msg: "Missing username or bio in the request" },
        { status: 400 }
      );
    }

    console.log('Username:', username);
    console.log('Bio:', bio);

    const updatedUser = await User.findByIdAndUpdate(user._id, {
      username,
      bio
    }, { new: true });

    if (!updatedUser) {
      return NextResponse.json(
        { msg: "There is an error updating the user" },
        { status: 400 }
      );
    }

    console.log('Updated User:', updatedUser);

    return NextResponse.json(
      {
        msg: "User updated successfully",
        updatedUser
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        msg: "Failed to update user",
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
