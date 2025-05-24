import { connect } from '@/db/dbConfig';
import { NextRequest, NextResponse } from 'next/server';
import { AuthContext, authEducatorMiddleware } from '@/middleware/authEducatorMiddleware';
import { Educator } from '@/models/models';

export async function PATCH(req: NextRequest) {
  await connect();

  try {
    const authResult = await authEducatorMiddleware(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { educator } = authResult as AuthContext;

    if (!educator) {
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

    const updatedUser = await Educator.findByIdAndUpdate(educator._id, {
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
    console.error('Error updating educator:', error);
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
