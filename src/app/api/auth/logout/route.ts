import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    const cookieOptions = [
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict',
      'token=; Path=/; Max-Age=0',
    ];

    cookieOptions.forEach(option => {
      response.headers.append('Set-Cookie', option);
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    const response = NextResponse.json(
      {
        success: false,
        message: 'Logout failed but cookies cleared',
      },
      { status: 500 }
    );

    response.headers.set(
      'Set-Cookie',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
    );

    return response;
  }
}
