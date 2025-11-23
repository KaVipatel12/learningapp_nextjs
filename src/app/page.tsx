'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Users, Award, BookOpen, Target, Clock, Play, Star, ArrowRight, Zap, Shield, Trophy, Video, CheckCircle, Globe } from 'lucide-react';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Course, useUser } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import HistorySlider from '@/components/HistoryCard';
import { courseCategories } from '@/constants/categories';

export interface Category { 
  id: string;
  name: string;
}

export interface WishList {
  id: string;
}

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const { user, userLoading, purchasedCoursesIds, purchasedCourses, fetchUserData } = useUser(); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const coursesContainerRef = useRef<HTMLDivElement>(null);
  const interestContainerRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoryCourses, setCategoryCourses] = useState<Course[]>([]);
  const [courseLoading, setCourseLoading] = useState<boolean>(false);
  const [courseCategoryLoading, setCourseCategoryLoading] = useState<boolean>(true);
  const [userWishlist, setUserWishList] = useState<WishList[]>([]);
  const [hasMoreInterest, setHasMoreInterest] = useState(true);
  const [hasMoreAllCourses, setHasMoreAllCourses] = useState(true);
  const [loadMore, setLoadMore] = useState(false); 
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Categories
  const categories: Category[] = [
    { id: 'all', name: 'Trending' },
    ...courseCategories
  ];

  // Receiving the purchased courses and wishlist
  useEffect(() => {
    if (userLoading) return;
    if (user?.wishlist) {
      const userWishlist = user.wishlist.map(id => id);
      setUserWishList(userWishlist); 
    }
  }, [user, userLoading, purchasedCourses, router]);

  // Fetch courses by category with pagination (for interest section)
  const fetchCourseByCategory = useCallback(async (page = 1, initialLoad = false) => {
    if (initialLoad) setCourseCategoryLoading(true);
    
    try {
      const categoryParam = user ? '' : 'programming';
      const response = await fetch(`/api/course/fetchcourse/fetchbycategory?page=${page}&limit=6${categoryParam ? `&category=${categoryParam}` : ''}`);
      if (!response.ok) throw new Error("Error in fetching course");

      const data = await response.json();
      if (Array.isArray(data.msg)) {
        const formattedCourses = data.msg.map((course: Course) => ({
          id: course._id,
          imageUrl: course.imageUrl,
          title: course.title,
          instructor: course.educatorName || 'Unknown Instructor',
          price: course.price,
          rating: course.averageRating,
          totalRatings: course.totalRatings,
          _id: course._id,
          educatorName: course.educatorName,
          averageRating: course.averageRating,
        }));

        setCategoryCourses(prev => page === 1 ? formattedCourses : [...prev, ...formattedCourses]);
        setHasMoreInterest(data.msg.length === 6);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      if (initialLoad) setCourseCategoryLoading(false);
    }
  }, [user]);

  // Fetch all courses with pagination
  const fetchCourse = useCallback(async (page = 1, initialLoad = false) => {
    if (initialLoad) setCourseLoading(true);
    
    try {
      let url: string;
      if (activeTab === 'all' || !activeTab) {
        url = `/api/course/fetchcourse?page=${page}&limit=6`;
      } else {
        // Use the single endpoint with a category query parameter, as identified from the working code.
        url = `/api/course/fetchcourse?category=${encodeURIComponent(activeTab)}&page=${page}&limit=6`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error in fetching course");

      const data = await response.json();
      if (Array.isArray(data.msg)) {
        const formattedCourses = data.msg.map((course: Course) => ({
          id: course._id,
          imageUrl: course.imageUrl,
          title: course.title,
          instructor: course.educatorName || 'Unknown Instructor',
          price: course.price,
          rating: course.averageRating,
          totalRatings: course.totalRatings,
          _id: course._id,
          educatorName: course.educatorName,
          averageRating: course.averageRating,
        }));

        if (page === 1) {
          setCourses(formattedCourses);
        } else {
          setCourses(prev => [...prev, ...formattedCourses]);
        }
        setHasMoreAllCourses(data.msg.length === 6);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      if (initialLoad) setCourseLoading(false);
    }
  }, [activeTab]);

  // Initial load
  useEffect(() => {
    fetchCourseByCategory(1, true);
  }, [fetchCourseByCategory, fetchCourse]);

  // Fetch courses when activeTab changes
  useEffect(() => {
    // Reset courses and fetch new ones when the tab changes
    setCourses([]);
    setHasMoreAllCourses(true); // Assume there are more pages until an empty response
    fetchCourse(1, true);
  }, [activeTab]);
  
  // Infinite scroll handlers
  const handleInterestScroll = useCallback(() => {
    const container = interestContainerRef.current;
    if (!container || !hasMoreInterest || loadMore) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    if (scrollLeft + clientWidth >= scrollWidth - 50) {
      setLoadMore(true);
      const nextPage = Math.floor(categoryCourses.length / 6) + 1;
      fetchCourseByCategory(nextPage).finally(() => setLoadMore(false));
    }
  }, [hasMoreInterest, loadMore, categoryCourses.length, fetchCourseByCategory]);

  const handleCoursesScroll = useCallback(() => {
    const container = coursesContainerRef.current;
    if (!container || !hasMoreAllCourses || loadMore) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    if (scrollLeft + clientWidth >= scrollWidth - 50) {
      setLoadMore(true);
      const nextPage = Math.floor(courses.length / 6) + 1;      
      fetchCourse(nextPage).finally(() => setLoadMore(false));
    }
  }, [hasMoreAllCourses, loadMore, courses.length, fetchCourse, activeTab]);

  // Scroll event listeners
  useEffect(() => {
    const interestContainer = interestContainerRef.current;
    const coursesContainer = coursesContainerRef.current;

    interestContainer?.addEventListener('scroll', handleInterestScroll);
    coursesContainer?.addEventListener('scroll', handleCoursesScroll);

    return () => {
      interestContainer?.removeEventListener('scroll', handleInterestScroll);
      coursesContainer?.removeEventListener('scroll', handleCoursesScroll);
    };
  }, [handleInterestScroll, handleCoursesScroll]);

  // Scroll functions
  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollCategoriesLeft = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollCategoriesRight = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const isWishlisted = (courseId: string) => {
    return userWishlist.some(id => id.toString() === courseId);
  };

  const isPurchased = (courseId: string) => {
    return purchasedCoursesIds.some(id => id.toString() === courseId);
  };

  const handleWishlistUpdate = async () => {
    await fetchUserData();
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section - Udemy Style */}
      <section className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-fuchsia-50 pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/backgroundImage2.png')] opacity-5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-pink-200">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-700">New courses added weekly</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Learn without limits
              </h1>

              <p className="text-lg text-gray-700 max-w-xl">
                Start, switch, or advance your career with thousands of courses from expert instructors. Learn at your own pace, 100% online.
              </p>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => router.push('/course')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all"
                >
                  Explore Courses
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-gray-700"><strong className="text-gray-900">50K+</strong> Active Learners</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-gray-700"><strong className="text-gray-900">5000+</strong> Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-gray-700"><strong className="text-gray-900">100+</strong> Expert Instructors</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/homepage.webp"
                  alt="Learning Platform"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Certification</div>
                    <div className="font-bold text-gray-900">Verified</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">HD Quality</div>
                    <div className="font-bold text-gray-900">Content</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-gray-50 py-8 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">100% Free Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">Learn Anywhere</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">Lifetime Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-700">Quick Learning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning Section */}
      {user && purchasedCourses.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Continue Learning</h2>
              <button 
                onClick={() => router.push('/course')}
                className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 text-sm"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative group">
              {purchasedCourses.length > 4 && (
                <>
                  <button
                    onClick={() => scrollLeft(scrollContainerRef)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => scrollRight(scrollContainerRef)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {purchasedCourses.map((course) => (
                  <div key={course.id} className="flex-shrink-0">
                    <Card
                      id={course.id}
                      imageUrl={course.imageUrl}
                      title={course.title}
                      instructor={course.instructor || course.educatorName || ''}
                      rating={course.rating || course.averageRating || 0}
                      totalRatings={course.totalRatings || 0}
                      isWishlisted={isWishlisted(course.id)}
                      isPurchased={true}
                      onWishlistToggle={handleWishlistUpdate}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Courses For You Section */}
      {user && categoryCourses.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Courses For You</h2>
                <p className="text-gray-600 mt-1">Based on your interests</p>
              </div>
              <button 
                onClick={() => router.push('/course')}
                className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 text-sm"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {courseCategoryLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="relative group">
                <button
                  onClick={() => scrollLeft(interestContainerRef)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <div
                  ref={interestContainerRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {categoryCourses.map((course) => (
                    <div key={course.id} className="flex-shrink-0">
                      <Card
                        id={course.id}
                        imageUrl={course.imageUrl}
                        title={course.title}
                        instructor={course.instructor || ''}
                        rating={course.rating || 0}
                        totalRatings={course.totalRatings || 0}
                        isWishlisted={isWishlisted(course.id)}
                        isPurchased={isPurchased(course.id)}
                        onWishlistToggle={handleWishlistUpdate}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollRight(interestContainerRef)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Tabs Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore by Category</h2>
          
          <div className="relative group mb-6">
            <button
              onClick={scrollCategoriesLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div
              ref={categoriesContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                  }}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === cat.id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              onClick={scrollCategoriesRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </section>

      {/* All Courses Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{activeTab === 'all' ? 'Popular Courses' : `Courses in ${categories.find(c => c.id === activeTab)?.name}`}</h2>
              <p className="text-gray-600 mt-1">Trending now</p>
            </div>
            <button 
              onClick={() => router.push('/course')}
              className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 text-sm"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {courseLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="relative group">
              <button
                onClick={() => scrollLeft(coursesContainerRef)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              <div
                ref={coursesContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {courses.map((course) => (
                  <div key={course.id} className="flex-shrink-0">
                    <Card
                      id={course.id}
                      imageUrl={course.imageUrl}
                      title={course.title}
                      instructor={course.instructor || ''}
                      rating={course.rating || 0}
                      totalRatings={course.totalRatings || 0}
                      isWishlisted={isWishlisted(course.id)}
                      isPurchased={isPurchased(course.id)}
                      onWishlistToggle={handleWishlistUpdate}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollRight(coursesContainerRef)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why learn with us?</h2>
            <p className="text-lg text-gray-600">Everything you need to succeed in your learning journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">HD Video Content</h3>
              <p className="text-sm text-gray-600">Learn from high-quality video lessons designed by experts</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Learn at Your Pace</h3>
              <p className="text-sm text-gray-600">Access courses anytime, anywhere, on any device</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-2xl border border-purple-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Earn Certificates</h3>
              <p className="text-sm text-gray-600">Get recognized for your achievements with certificates</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Expert Community</h3>
              <p className="text-sm text-gray-600">Connect with instructors and fellow learners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Become Instructor CTA */}
      <section className="py-16 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4">Become an Instructor</h2>
              <p className="text-lg text-pink-50 mb-6">Share your knowledge with millions of students worldwide. Join our community of expert instructors.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Reach students globally</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Create engaging courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Build your reputation</span>
                </li>
              </ul>
              <button 
                onClick={() => router.push('/register')}
                className="px-8 py-3 bg-white text-pink-600 rounded-lg font-bold hover:bg-gray-50 shadow-lg transition-all"
              >
                Get Started Today
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/blogsectionimg.jpg"
                  alt="Become an Instructor"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Start learning today</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of students already learning on our platform</p>
          <button 
            onClick={() => router.push('/course')}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-bold text-lg hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all"
          >
            Browse All Courses
          </button>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
