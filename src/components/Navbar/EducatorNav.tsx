'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Book, Home, Video , Settings, LogIn, LogOut, UserPlus, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEducator } from '@/context/educatorContext';

export default function EducatorNav() {
  const { educator, loading } = useEducator();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag and scroll listener
  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, []);

  // Only render auth-related UI on client-side
  const renderAuthButtons = () => {
    if (!isClient || loading) {
      return (
        <div className="flex items-center space-x-4">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    return educator ? (
      <div className="flex items-center space-x-6">
        <Link href="/dashboard" className="flex items-center">
          {educator.avatar ? (
            <Image
              src={educator.avatar}
              alt={educator.name}
              width={32}
              height={32}
              className="rounded-full"
              priority
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            </div>
          )}
          <span className="ml-2 text-gray-700">{educator.name?.split(' ')[0]}</span>
        </Link>
        <Link href="/api/auth/logout" className="text-gray-700 hover:text-red-600 transition flex items-center">
          <LogOut className="mr-1 h-4 w-4" /> Logout
        </Link>
      </div>
    ) : (
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-gray-700 hover:text-blue-600 transition flex items-center">
          <LogIn className="mr-1 h-4 w-4" /> Login
        </Link>
        <Link 
          href="/register" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center"
        >
          <UserPlus className="mr-1 h-4 w-4" /> Register
        </Link>
      </div>
    );
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Book className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">EduPlatform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition flex items-center">
              <Home className="mr-1 h-4 w-4" /> Home
            </Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition flex items-center">
              <Video className="mr-1 h-4 w-4" /> Courses
            </Link>
            
            {renderAuthButtons()}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link 
              href="/" 
              className="  px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition flex items-center"
            >
              <Home className="mr-2 h-5 w-5" /> Home
            </Link>
            <Link 
              href="/courses" 
              className="  px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition flex items-center"
            >
              <Video className="mr-2 h-5 w-5" /> Courses
            </Link>
            
            {isClient && !loading && (educator ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="  px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition flex items-center"
                >
                  <User className="mr-2 h-5 w-5" /> Profile
                </Link>
                <Link 
                  href="/settings" 
                  className="  px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition flex items-center"
                >
                  <Settings className="mr-2 h-5 w-5" /> Settings
                </Link>
                <Link 
                  href="/api/auth/logout" 
                  className="  px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition flex items-center"
                >
                  <LogOut className="mr-2 h-5 w-5" /> Logout
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="  px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition flex items-center"
                >
                  <LogIn className="mr-2 h-5 w-5" /> Login
                </Link>
                <Link 
                  href="/register" 
                  className="  px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <UserPlus className="mr-2 h-5 w-5" /> Register
                </Link>
              </>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}