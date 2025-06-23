// /api/auth/logout/route.js (Next.js 13+ App Router)
// OR /pages/api/auth/logout.js (Next.js Pages Router)

import { NextResponse } from 'next/server';

// For Next.js 13+ App Router
export async function POST(request) {
  try {
    // Get the token from cookies or authorization header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');


                  console.log(token)
    // Create response
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully' 
      },
      { status: 200 }
    );

    // Clear the token cookie with all possible configurations
    const cookieOptions = [
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict',
      'token=; Path=/; Max-Age=0'
    ];

    // Set multiple Set-Cookie headers to ensure cookie is cleared
    cookieOptions.forEach(option => {
      response.headers.append('Set-Cookie', option);
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we should still try to clear cookies
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Logout failed but cookies cleared' 
      },
      { status: 500 }
    );

    // Clear cookies even on error
    response.headers.set('Set-Cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    
    return response;
  }
}

// For Next.js Pages Router (alternative)
/*
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from cookies or authorization header
    const token = req.cookies.token || 
                  req.headers.authorization?.replace('Bearer ', '');

    // Optional: Blacklist token logic
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add to blacklist if needed
        console.log('User logged out:', decoded.userId || decoded.id);
      } catch (jwtError) {
        console.log('Invalid token during logout:', jwtError.message);
      }
    }

    // Clear cookie with multiple configurations
    const cookieOptions = [
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'token=; Path=/; Max-Age=0; HttpOnly'
    ];

    // Set multiple cookie headers
    res.setHeader('Set-Cookie', cookieOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    // Clear cookies even on error
    res.setHeader('Set-Cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    
    return res.status(500).json({ 
      success: false, 
      message: 'Logout failed but cookies cleared' 
    });
  }
}
*/