'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, Book, Home, Video, LogIn, LogOut, UserPlus, Heart, GraduationCap, Loader2, Plus, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/userContext';
import NotificationDropdown from './Notification';

export default function AppNavbar() {
  const { user, userLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navbarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { fetchUserData } = useUser();

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          navbarRef.current && 
          !navbarRef.current.contains(event.target) && 
          menuButtonRef.current && 
          !menuButtonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  const logOut = async () => {
    const confirmation = confirm("Do you really want to logout?")
    if(!confirmation) return;
    if (loggingOut) return;
    
    setLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        fetchUserData()
        window.location.href = '/login'
      }
    } finally {
      setLoggingOut(false);
    }
  };

  const LogoutButton = ({ isMobile = false }) => (
    <button 
      onClick={() => {
        logOut();
        if (isMobile) closeMobileMenu();
      }} 
      disabled={loggingOut}
      className={`text-rose-700 hover:text-rose-900 transition flex items-center ${
        loggingOut ? 'opacity-50 cursor-not-allowed' : ''
      } ${isMobile ? 'px-3 py-2 rounded-md text-base font-medium hover:bg-pink-50' : ''}`}
    >
      {loggingOut ? (
        <Loader2 className="mr-1 h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="mr-1 h-5 w-5" />
      )}
      <span className={isMobile ? '' : 'hidden md:inline'}>
        {loggingOut ? 'Logging out...' : ''}
      </span>
    </button>
  );

  const renderAuthButtons = () => {
    if (!isClient || userLoading) {
      return (
        <div className="flex items-center space-x-4">
          <div className="h-8 w-16 bg-pink-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-pink-200 rounded animate-pulse"></div>
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex items-center space-x-6">
          {/* Admin link - only show /admin */}
          {user.role === "admin" && (
            <Link 
              href="/admin"
              className="text-rose-800 hover:text-rose-600 transition flex items-center"
            >
              <Shield className="mr-1 h-5 w-5" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          {user.role === "educator" && (
            <Link href="/educator/addcourse" className="text-rose-800 hover:text-rose-600 transition flex items-center">
              <Plus className="mr-1 h-5 w-5" />
              <span className="hidden md:inline">Add Course</span>
            </Link>
          )}

          <Link href="/course" className="text-rose-800 hover:text-rose-600 transition flex items-center">
            <Video className="mr-1 h-5 w-5" /> 
            <span className="hidden md:inline">Courses</span>
          </Link>

          {user.role !== "educator" && (
            <Link href="/user/wishlist" className="text-rose-700 hover:text-rose-900 transition flex items-center">
              <Heart className="mr-1 h-5 w-5" />
              <span className="hidden md:inline">Wishlist</span>
            </Link>
          )}

          <NotificationDropdown user={user} />

          <Link href="/user/profile" className="flex items-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.username}
                width={32}
                height={32}
                className="rounded-full"
                priority
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                {user.role === "educator" ? (
                  <GraduationCap className="h-4 w-4 text-pink-600" />
                ) : (
                  <User className="h-4 w-4 text-pink-600" />
                )}
              </div>
            )}
          </Link>

          <LogoutButton />
        </div>
      );
    }

    // Default navigation for unauthenticated users
    return (
      <div className="flex items-center space-x-4">
        <Link href="/course" className="text-rose-800 hover:text-rose-600 transition flex items-center">
          <Video className="mr-1 h-5 w-5" />
          <span className="hidden md:inline">Browse Courses</span>
        </Link>
        <Link href="/login" className="text-rose-700 hover:text-rose-900 transition flex items-center">
          <LogIn className="mr-1 h-5 w-5" />
          <span className="hidden md:inline">Login</span>
        </Link>
        <Link 
          href="/register" 
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 text-white px-4 py-2 rounded-md transition flex items-center shadow-md"
        >
          <UserPlus className="mr-1 h-5 w-5" />
          <span className="hidden md:inline">Register</span>
        </Link>
      </div>
    );
  };

  const renderMobileAuthButtons = () => {
    if (!isClient || userLoading) {
      return null;
    }

    if (user) {
      return (
        <>
          {/* Admin link - only show /admin */}
          {user.role === "admin" && (
            <Link 
              href="/admin"
              onClick={closeMobileMenu}
              className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
            >
              <Shield className="mr-2 h-5 w-5" /> Admin
            </Link>
          )}

          {user.role === "educator" && (
            <Link 
              href="/educator/addcourse" 
              onClick={closeMobileMenu}
              className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Course
            </Link>
          )}

          <Link 
            href="/course" 
            onClick={closeMobileMenu}
            className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
          >
            <Video className="mr-2 h-5 w-5" /> Courses
          </Link>

          {user.role !== "educator" && (
            <Link 
              href="/user/wishlist" 
              onClick={closeMobileMenu}
              className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
            >
              <Heart className="mr-2 h-5 w-5" /> Wishlist
            </Link>
          )}

          <Link 
            href="/user/profile" 
            onClick={closeMobileMenu}
            className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
          >
            {user.role === "educator" ? (
              <GraduationCap className="mr-2 h-5 w-5" />
            ) : (
              <User className="mr-2 h-5 w-5" />
            )}
            Profile
          </Link>

          <LogoutButton isMobile={true} />
        </>
      );
    }

    // Default mobile navigation for unauthenticated users
    return (
      <>
        <Link 
          href="/course" 
          onClick={closeMobileMenu}
          className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
        >
          <Video className="mr-2 h-5 w-5" /> Browse Courses
        </Link>
        <Link 
          href="/login" 
          onClick={closeMobileMenu}
          className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
        >
          <LogIn className="mr-2 h-5 w-5" /> Login
        </Link>
        <Link 
          href="/register" 
          onClick={closeMobileMenu}
          className="px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 transition flex items-center justify-center"
        >
          <UserPlus className="mr-2 h-5 w-5" /> Register
        </Link>
      </>
    );
  };

  return (
    <header   ref={navbarRef} className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
            <Book className="h-8 w-8 text-rose-600" />
            <span className="ml-2 text-xl font-bold text-rose-900">EduPlatform</span>
          </Link>

          {/* Desktop Navigation */} 
         <nav className="hidden md:flex items-center ml-6 space-x-6">
            <Link href="/" className="text-rose-800 hover:text-rose-600 transition flex items-center">
              <Home className="mr-1 h-5 w-5" /> Home
            </Link>            
            {renderAuthButtons()}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && (
              <div className="mr-4">
                <NotificationDropdown user={user} />
              </div>
            )}
            <button
             ref={menuButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="text-rose-800 hover:text-rose-600 focus:outline-none"
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
              onClick={closeMobileMenu}
              className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
            >
              <Home className="mr-2 h-5 w-5" /> Home
            </Link>
            
            {renderMobileAuthButtons()}
          </div>
        </div>
      )}
    </header>
  );
}