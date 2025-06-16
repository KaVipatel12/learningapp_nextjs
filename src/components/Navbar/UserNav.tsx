'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, Book, Home, Video, LogIn, LogOut, UserPlus, Heart, GraduationCap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/userContext';
import { useEducator } from '@/context/educatorContext';
import { useRouter } from 'next/navigation';

export default function AppNavbar() {
  const { user, userLoading } = useUser();
  const { educator, educatorLoading } = useEducator();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter(); 
  const { fetchUserData } = useUser(); 

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  const logOut = async () => {
    if (loggingOut) return; // Prevent multiple clicks
    
    setLoggingOut(true);
    
    try {
      // Call backend logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies in request
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Logout successful:', result.message);
      } else {
        console.error('Logout API error:', result.message);
        // Continue with logout process even if API fails
      }
      
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with logout process even if request fails
    }
    
    try {
      // Refresh user data to update UI state
      await fetchUserData();
      
      // Navigate to home page
      router.push("/");
      
      // Force a page refresh to clear any cached data
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error during logout cleanup:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const LogoutButton = ({ isMobile = false }) => (
    <button 
      onClick={logOut} 
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
        {loggingOut ? 'Logging out...' : 'Logout'}
      </span>
    </button>
  );

  const renderAuthButtons = () => {
    if (!isClient || userLoading || educatorLoading) {
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
          <Link href="/user/wishlist" className="text-rose-700 hover:text-rose-900 transition flex items-center">
            <Heart className="mr-1 h-5 w-5" />
            <span className="hidden md:inline">Wishlist</span>
          </Link>
          <Link href="/course" className="text-rose-800 hover:text-rose-600 transition flex items-center">
            <Video className="mr-1 h-5 w-5" /> Courses
          </Link>
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
                <User className="h-4 w-4 text-pink-600" />
              </div>
            )}
            <span className="ml-2 text-rose-800">{user.username?.split(' ')[0]}</span>
          </Link>
          <LogoutButton />
        </div>
      );
    }

    if (educator) {
      return (
        <div className="flex items-center space-x-6">
          <Link href="/educator/profile" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-pink-600" />
            </div>
            <span className="ml-2 text-rose-800">{educator.username?.split(' ')[0]}</span>
          </Link>
          <LogoutButton />
        </div>
      );
    }

    // Default navigation for unauthenticated users
    return (
      <div className="flex items-center space-x-6">
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
    if (!isClient || userLoading || educatorLoading) {
      return null;
    }

    if (user) {
      return (
        <>
          <Link 
            href="/user/wishlist" 
            className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
          >
            <Heart className="mr-2 h-5 w-5" /> Wishlist
          </Link>
          <Link 
            href="/courses" 
            className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
          >
            <Video className="mr-2 h-5 w-5" /> Courses
          </Link>
          <Link 
            href="/user/profile" 
            className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
          >
            <User className="mr-2 h-5 w-5" /> Profile
          </Link>
          <LogoutButton isMobile={true} />
        </>
      );
    }

    if (educator) {
      return (
        <>
          <Link 
            href="/educator/profile" 
            className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
          >
            <GraduationCap className="mr-2 h-5 w-5" /> Profile
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
          className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
        >
          <Video className="mr-2 h-5 w-5" /> Browse Courses
        </Link>
        <Link 
          href="/login" 
          className="px-3 py-2 rounded-md text-base font-medium text-rose-800 hover:text-rose-600 hover:bg-pink-50 transition flex items-center"
        >
          <LogIn className="mr-2 h-5 w-5" /> Login
        </Link>
        <Link 
          href="/register" 
          className="px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 transition flex items-center justify-center"
        >
          <UserPlus className="mr-2 h-5 w-5" /> Register
        </Link>
      </>
    );
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={educator ? "/educator/profile" : "/"} className="flex items-center">
            <Book className="h-8 w-8 text-rose-600" />
            <span className="ml-2 text-xl font-bold text-rose-900">EduPlatform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href={educator ? `/educator/profile` : "/"} className="text-rose-800 hover:text-rose-600 transition flex items-center">
              <Home className="mr-1 h-5 w-5" /> Home
            </Link>            
            {renderAuthButtons()}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
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