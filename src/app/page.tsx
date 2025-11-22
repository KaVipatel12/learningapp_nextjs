'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Users, Award, BookOpen, Target, Clock, Play, Star, ArrowRight } from 'lucide-react';
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

export interface Feature {
  title: string;
  description: string;
  image: string;
}

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const { user, userLoading, purchasedCoursesIds, purchasedCourses, fetchUserData } = useUser(); 
  const [purchasedCourse, setPurchasedCourse] = useState<Course[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const coursesContainerRef = useRef<HTMLDivElement>(null);
  const interestContainerRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoryCourses, setCategoryCourses] = useState<Course[]>([]);
  const [category, setCategory] = useState<string>("");
  const [courseLoading, setCourseLoading] = useState<boolean>(false);
  const [courseCategoryLoading, setCourseCategoryLoading] = useState<boolean>(true);
  const [userWishlist, setUserWishList] = useState<WishList[]>([]);
  const [interestPage, setInterestPage] = useState(1);
  const [allCoursesPage, setAllCoursesPage] = useState(1);
  const [hasMoreInterest, setHasMoreInterest] = useState(true);
  const [hasMoreAllCourses, setHasMoreAllCourses] = useState(true);
  const [loadMore, setLoadMore] = useState(false); 
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Categories
  const categories: Category[] = [
    { id: 'all', name: 'Trending' }, // 'Trending' is a special case for this page
    ...courseCategories
  ];

  // Features sections
  const features: Feature[] = [
    {
      title: 'Learn Anything',
      description: 'Access over 5000 high-quality courses spanning categories such as technology, business, personal development, and more.',
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80'
    },
    {
      title: 'Expert Instructors',
      description: 'Learn directly from experienced industry professionals who bring real-world knowledge into every lesson.',
      image: '/blogsectionimg.jpg'
    }
  ];

  // Receiving the purchased courses and wishlist
  useEffect(() => {
    if (userLoading) return;
    if (purchasedCourses.length > 0) {
      setPurchasedCourse(purchasedCourses); 
    }
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
          educatorName: course.educatorName || ''
        }));

        setCategoryCourses(prev => initialLoad ? formattedCourses : [...prev, ...formattedCourses]);
        setHasMoreInterest(data.msg.length === 6);
      } else {
        setHasMoreInterest(false);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setHasMoreInterest(false);
    } finally {
      if (initialLoad) setCourseCategoryLoading(false);
      setLoadMore(false);
    }
  }, [user]);

  // Fetch all courses with pagination
  const fetchCourses = useCallback(async (page = 1, initialLoad = false) => {
    if (initialLoad) setCourseLoading(true);
    
    const effectiveCategory = activeTab === "all" ? "" : activeTab;
    const endpoint = effectiveCategory.length === 0
      ? `/api/course/fetchcourse?page=${page}&limit=6` // 'all' is for trending, so no category filter
      : `/api/course/fetchcourse?category=${encodeURIComponent(effectiveCategory)}&page=${page}&limit=6`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Error in fetching course");

      const data = await response.json();
      if (Array.isArray(data.msg)) {
        const formattedCourses = data.msg.map((course: Course) => ({
          id: course._id,
          imageUrl: course.imageUrl,
          title: course.title,
          instructor: course.educatorName || 'Unknown Instructor',
          price: course.price,
          rating: course.averageRating || 0,
          totalRatings: course.totalRatings || 0,
          educatorName: course.educatorName || ''
        }));

        setCourses(prev => {
          const newCourses = initialLoad ? formattedCourses : [...prev, ...formattedCourses];
          // Remove duplicates by ID, keeping the first occurrence
          const uniqueCourses = newCourses.filter((course, index, self) =>
            index === self.findIndex((c) => c.id === course.id));
          return uniqueCourses;
        });
        setHasMoreAllCourses(data.msg.length > 0);
      } else {
        setHasMoreAllCourses(false);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setHasMoreAllCourses(false);
    } finally {
      if (initialLoad) setCourseLoading(false);
      setLoadMore(false);
    }
  }, [activeTab]);

  // Initial loads
  useEffect(() => {
    fetchCourseByCategory(1, true);
  }, [fetchCourseByCategory]);

  useEffect(() => {
    setCourses([]);
    setAllCoursesPage(1);
    setHasMoreAllCourses(true);
    fetchCourses(1, true);
  }, [activeTab, fetchCourses]);

  // Improved scroll handlers for infinite loading
  const handleInterestScroll = useCallback(() => {
    if (!interestContainerRef.current || courseCategoryLoading || !hasMoreInterest) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = interestContainerRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 200) { // Increased threshold
      setInterestPage(prevPage => {
        fetchCourseByCategory(prevPage + 1);
        return prevPage + 1;
      });
    }
  }, [courseCategoryLoading, hasMoreInterest, fetchCourseByCategory]);

  const handleCoursesScroll = useCallback(() => {
    if (!coursesContainerRef.current || courseLoading || !hasMoreAllCourses) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = coursesContainerRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 200) { // Increased threshold
      setAllCoursesPage(prevPage => {
        fetchCourses(prevPage + 1);
        return prevPage + 1;
      });
    }
  }, [courseLoading, hasMoreAllCourses, fetchCourses]);

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

  const scrollContainer = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
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
    // Refetch user data to get the latest wishlist
    await fetchUserData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white">

      {/* Hero Section - Completely Redesigned */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full border border-pink-200">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-semibold text-pink-700">Transform Your Future with Learning</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Unlock Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Potential Today
                </span>
              </h1>

              <p className="text-xl text-rose-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Join thousands of learners worldwide. Access expert-led courses, earn certificates, and advance your career with our premium learning platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => router.push('/course')}
                  className="group px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-pink-glow transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Learning Free
                  <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => router.push('/course')}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-pink-700 rounded-2xl font-bold text-lg shadow-lg border-2 border-pink-200 hover:border-pink-300 transition-all duration-300 transform hover:scale-105"
                >
                  Browse Courses
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">5000+</div>
                  <div className="text-sm text-rose-600 mt-1">Courses</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">50K+</div>
                  <div className="text-sm text-rose-600 mt-1">Learners</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">4.8★</div>
                  <div className="text-sm text-rose-600 mt-1">Rating</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-scale-in hidden lg:block">
              <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-elegant">
                <Image
                  src="/homepage.webp"
                  alt="Learning Platform"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/20 via-transparent to-fuchsia-900/20"></div>
              </div>
              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-elegant animate-pulse border border-pink-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-pink-900">Certificate</div>
                    <div className="text-xs text-rose-600">Earn & Showcase</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-elegant animate-pulse border border-pink-100" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-pink-900">Community</div>
                    <div className="text-xs text-rose-600">Learn Together</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Watch History */}
      <HistorySlider />

      {/* Continue Learning Section */}
      {purchasedCourse.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-pink-600" />
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Continue Learning
                </h2>
              </div>
              <p className="text-rose-700 text-lg">Pick up where you left off</p>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="relative group">
              {purchasedCourse.length > 4 && (
                <>
                  <button 
                    onClick={() => scrollLeft(scrollContainerRef)}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-elegant hover:shadow-card-hover transition-all hover:scale-110 opacity-0 group-hover:opacity-100 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => scrollRight(scrollContainerRef)}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-elegant hover:shadow-card-hover transition-all hover:scale-110 opacity-0 group-hover:opacity-100 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              
              <div 
                ref={scrollContainerRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-6 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {purchasedCourse.map((course) => (
                  <div key={course.id} className="flex-shrink-0 w-80 md:w-96">
                    <Card
                      id={course?.id || ''}
                      imageUrl={course.imageUrl || ''}
                      title={course.title || ''}
                      instructor={course.instructor || ''}
                      price={course.price}
                      rating={4.5}
                      totalRatings={0}
                      discountedPrice={course.price}
                      isWishlisted={isWishlisted(course.id)}
                      onWishlistToggle={handleWishlistUpdate}
                      isPurchased={true}
                      showWishlist={false}
                      showRatings={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Courses of Interest */}
      {categoryCourses.length > 0 && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-pink-600 fill-pink-600" />
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Courses for You
                </h2>
              </div>
              <p className="text-rose-700 text-lg">Personalized recommendations based on your interests</p>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {!courseCategoryLoading ? (
              categoryCourses.length > 0 ? (
                <div className="relative group">
                  {categoryCourses.length > 4 && (
                    <>
                      <button 
                        onClick={() => scrollLeft(interestContainerRef)}
                        className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-elegant hover:shadow-card-hover transition-all hover:scale-110 opacity-0 group-hover:opacity-100 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={() => scrollRight(interestContainerRef)}
                        className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-elegant hover:shadow-card-hover transition-all hover:scale-110 opacity-0 group-hover:opacity-100 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  
                  <div 
                    ref={interestContainerRef}
                    className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-6 px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {categoryCourses.map((course) => (
                      <div key={course.id} className="flex-shrink-0 w-80 md:w-96">
                        <Card
                          id={course?.id || ''}
                          imageUrl={course.imageUrl || ''}
                          title={course.title || ''}
                          instructor={course.instructor || ''}
                          price={course.price}
                          rating={course.averageRating || 0}
                          totalRatings={course.totalRatings || 0}
                          discountedPrice={course.price}
                          isWishlisted={isWishlisted(course.id || '')}
                          onWishlistToggle={() => {}}
                          isPurchased={isPurchased(course?.id || '')}
                        />
                      </div>
                    ))}
                    {courseCategoryLoading && hasMoreInterest && (
                      <div className="flex-shrink-0 w-80 flex items-center justify-center">
                        <LoadingSpinner height="h-8" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white/60 rounded-3xl">
                  <p className="text-rose-600 text-lg">No courses found</p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <LoadingSpinner height="h-30" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Explore by Category & All Courses */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-pink-600" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                Explore All Courses
              </h2>
            </div>
            <p className="text-rose-700 text-lg">Browse thousands of courses across all categories</p>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Categories Filter */}
          <div className="mb-12">
            <div className="relative group">
              {categories.length > 5 && (
                <>
                  <button 
                    onClick={scrollCategoriesLeft}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:shadow-pink-glow transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5 text-pink-600" />
                  </button>
                  <button 
                    onClick={scrollCategoriesRight}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:shadow-pink-glow transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5 text-pink-600" />
                  </button>
                </>
              )}
              
              <div 
                ref={categoriesContainerRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-6 py-3 rounded-2xl whitespace-nowrap flex-shrink-0 font-semibold transition-all duration-300 transform hover:scale-105 ${
                      activeTab === cat.id 
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white shadow-lg shadow-pink-300' 
                        : 'bg-white text-pink-700 border-2 border-pink-200 hover:border-pink-400 hover:shadow-md'
                    }`}
                    onClick={() => { 
                      setActiveTab(cat.id);
                      setCategory(cat.id);
                      setCourses([]);
                      setAllCoursesPage(1);
                      setHasMoreAllCourses(true);
                      fetchCourses(1, true);
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* All Courses Grid/Carousel */}
          {!courseLoading ? (
            courses.length > 0 ? (
              <div className="relative group">
                {courses.length > 4 && (
                  <>
                    <button 
                      onClick={() => scrollLeft(coursesContainerRef)}
                      className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-elegant hover:shadow-card-hover transition-all hover:scale-110 opacity-0 group-hover:opacity-100 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={() => {
                        scrollRight(coursesContainerRef);
                        if (hasMoreAllCourses) {
                          setLoadMore(true);
                        }
                      }}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-elegant hover:shadow-card-hover transition-all hover:scale-110 opacity-0 group-hover:opacity-100 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                
                <div 
                  ref={coursesContainerRef}
                  className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-6 px-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {courses.map((course) => (
                    <div key={course.id} className="flex-shrink-0 w-80 md:w-96">
                      <Card
                        id={course.id || ''}
                        imageUrl={course.imageUrl || ''}
                        title={course.title || ''}
                        instructor={course.instructor || ''}
                        price={course.price}
                        rating={course.rating || 0}
                        totalRatings={course.totalRatings || 0}
                        discountedPrice={course.price}
                        isWishlisted={isWishlisted(course.id || '') || false}
                        onWishlistToggle={() => {}}
                        isPurchased={isPurchased(course?.id || '')}
                      />
                    </div>
                  ))}
                  {loadMore && hasMoreAllCourses && (
                    <div className="flex-shrink-0 w-80 flex items-center justify-center">
                      <LoadingSpinner height="h-8" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/60 rounded-3xl">
                <p className="text-rose-600 text-lg">No courses found</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <LoadingSpinner height="h-30" />
            </div>
          )}
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                Why Choose Our Platform
              </span>
            </h2>
            <p className="text-rose-700 text-xl max-w-3xl mx-auto leading-relaxed">
              Everything you need to succeed in your learning journey, all in one place
            </p>
            <div className="w-32 h-1.5 bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500 mx-auto mt-6 rounded-full shadow-pink-glow"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Expert-Led Courses"
              description="Learn from industry professionals with years of real-world experience and proven teaching methods"
            />
            <FeatureCard
              icon={Users}
              title="Active Community"
              description="Join thousands of learners worldwide, share knowledge, and grow together in a supportive environment"
            />
            <FeatureCard
              icon={Award}
              title="Verified Certificates"
              description="Earn recognized certificates upon completion to showcase your achievements and advance your career"
            />
            <FeatureCard
              icon={Target}
              title="Track Progress"
              description="Monitor your learning journey with detailed analytics and personalized recommendations"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Career Growth"
              description="Access resources and guidance to help you achieve your professional goals and aspirations"
            />
            <FeatureCard
              icon={Clock}
              title="Learn at Your Pace"
              description="Flexible schedules that fit your lifestyle, with 24/7 access to all course materials"
            />
          </div>
        </div>
      </section>

      {/* Expert Instructors Section */}
      <section className="py-20 bg-gradient-to-br from-white via-pink-50 to-rose-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Learn from Expert Instructors
                  </span>
                </h2>
                <p className="text-rose-800 text-xl leading-relaxed">
                  Our carefully selected instructors bring years of industry experience and
                  a passion for teaching to create engaging, effective learning experiences.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-5 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 group border border-pink-100">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-pink-900 mb-2">Industry Experts</h3>
                    <p className="text-rose-700 leading-relaxed">Learn from professionals with proven track records and real-world experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 group border border-pink-100">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-pink-900 mb-2">Personalized Support</h3>
                    <p className="text-rose-700 leading-relaxed">Get guidance tailored to your unique learning journey and goals</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 group border border-pink-100">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-rose-500 to-fuchsia-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-pink-900 mb-2">Comprehensive Content</h3>
                    <p className="text-rose-700 leading-relaxed">Structured courses designed for maximum learning and skill development</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="relative rounded-3xl overflow-hidden shadow-elegant group">
                <Image
                  src="/blogsectionimg.jpg"
                  alt="Expert instructors"
                  width={700}
                  height={500}
                  className="object-cover w-full h-[500px] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xl font-semibold">Join 50,000+ learners worldwide</p>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
              <div className="absolute -top-8 -left-8 w-48 h-48 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-pink-100 mb-12 max-w-2xl mx-auto">
            Join thousands of successful learners today and unlock your full potential with our premium courses
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => router.push('/course')}
              className="group px-10 py-5 bg-white text-pink-700 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-pink-glow transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => router.push('/course')}
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              View All Courses
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-12">
            <div className="text-white">
              <div className="text-3xl font-bold">5000+</div>
              <div className="text-pink-100 text-sm">Quality Courses</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-pink-100 text-sm">Happy Students</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-pink-100 text-sm">Average Rating</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-pink-100 text-sm">Support Available</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-card hover:shadow-elegant transition-all duration-500 animate-scale-in group border border-pink-100 hover:border-pink-300 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10">
      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-pink-glow transition-all group-hover:scale-110 group-hover:rotate-6 shadow-lg">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-pink-900 mb-4 group-hover:text-pink-600 transition-colors">{title}</h3>
      <p className="text-rose-700 leading-relaxed text-lg">{description}</p>
    </div>
    
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200 to-transparent rounded-bl-full opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
  </div>
);

export default HomePage;
