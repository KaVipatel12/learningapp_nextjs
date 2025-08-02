// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface MyTokenPayload extends JwtPayload {
  role: string;
  userId: string;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const secret = process.env.JWT_SECRET;
  const currentPath = request.nextUrl.pathname;

  // Define all protected paths
  const protectedPaths = [
    '/user',
    '/educator',
    '/course',
    '/category'
  ];

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // If no token on protected route, redirect to login
  if (!token || !secret) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const decoded = jwt.verify(token, secret) as MyTokenPayload;    
    const isEducator = decoded.role === 'educator';
    const isStudent = decoded.role === 'student';

    // Paths restricted for educators (they can't access student-specific routes)
    const educatorRestrictedPaths = [
      '/user/profile',
      '/user/wishlist',
      '/user/settings',
      '/course' // If this is student course browsing
    ];

    // Paths restricted for students (they can't access educator-specific routes)
    const studentRestrictedPaths = [
      '/educator/profile',
      '/educator/settings', 
      '/educator/addcourse',
      '/educator/teachingfocus',
      '/educator/bio',
      '/educator/editcourse',
      '/educator/addchapter'
    ];

    // Check educator restrictions
    if (isEducator) {
      const isDenied = educatorRestrictedPaths.some(path => currentPath.startsWith(path));
      if (isDenied) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Check student restrictions  
    if (isStudent) {
      const isDenied = studentRestrictedPaths.some(path => currentPath.startsWith(path));
      if (isDenied) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Invalid or expired token:', error);
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, register, unauthorized (auth pages)
     * - / (home page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|unauthorized|$).*)',
  ],
};