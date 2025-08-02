'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Course, useUser } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import HistorySlider from '@/components/HistoryCard';

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
  const { user, userLoading, purchasedCoursesIds, purchasedCourses } = useUser(); 
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

  // Carousel images
  const carouselImages: string[] = [
    '/homepage.webp'
  ];

  // Categories
  const categories: Category[] = [
    { id: 'all', name: 'Trending' },
    { id: 'tech', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'design', name: 'Design' },
    { id: 'programming', name: 'Programming' },
    { id: 'data science', name: 'Data Science' },
    { id: 'science', name: 'Science' },
  ];

  // Features sections
 const features: Feature[] = [
  {
    title: 'Learn Anything',
    description: 'Access over 5000 high-quality courses spanning categories such as technology, business, personal development, and more. Whether you’re a beginner or a pro, our platform helps you learn at your own pace and skill level.',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80'
  },
  {
    title: 'Expert Instructors',
    description: 'Learn directly from experienced industry professionals who bring real-world knowledge into every lesson. Our instructors are carefully selected to ensure you receive practical, up-to-date, and engaging content.',
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
      // If user is not logged in, fetch programming courses by default
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
      setCourseCategoryLoading(false);
      setLoadMore(false);
    }
  }, [user]);

  // Fetch all courses with pagination
  const fetchCourses = useCallback(async (page = 1, initialLoad = false) => {
    if (initialLoad) setCourseLoading(true);

    const effectiveCategory = category === "all" ? "" : category;
    const endpoint = effectiveCategory.length === 0
      ? `/api/course/fetchcourse?page=${page}&limit=6`
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

        setCourses(prev => initialLoad ? formattedCourses : [...prev, ...formattedCourses]);
        setHasMoreAllCourses(data.msg.length === 6);
      } else {
        setHasMoreAllCourses(false);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setHasMoreAllCourses(false);
    } finally {
      setCourseLoading(false);
      setLoadMore(false);
    }
  }, [category]);

  // Initial loads
  useEffect(() => {
    fetchCourseByCategory(1, true);
    fetchCourses(1, true);
  }, [fetchCourses , fetchCourseByCategory]);

  // Improved scroll handlers for infinite loading
  const handleInterestScroll = useCallback(() => {
    if (!interestContainerRef.current || courseCategoryLoading || !hasMoreInterest) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = interestContainerRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 100) {
      setInterestPage(prev => prev + 1);
      fetchCourseByCategory(interestPage + 1);
    }
  }, [courseCategoryLoading, hasMoreInterest, interestPage, fetchCourseByCategory]);

  const handleCoursesScroll = useCallback(() => {
    if (!coursesContainerRef.current || courseLoading || !hasMoreAllCourses) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = coursesContainerRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 100) {
      setAllCoursesPage(prev => prev + 1);
      fetchCourses(allCoursesPage + 1);
    }
  }, [courseLoading, hasMoreAllCourses, allCoursesPage, fetchCourses]);

  // Improved scroll event listeners
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

  // Scroll functions for horizontal containers
  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
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

  return (
    <div className="min-h-screen">

      {/* Hero Carousel - Updated for tablet responsiveness */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden ">
        <div className="flex h-full transition-transform duration-500 ease-in-out mt-10">
          {carouselImages.map((img, index) => (
            <div key={index} className="min-w-full h-full relative">
              <Image
                src={img}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 via-rose-800/40 to-purple-900/60 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">Start Learning Today</h1>
                  <p className="text-base sm:text-lg md:text-xl mb-6 drop-shadow-md">Unlock your potential with our expert-led courses</p>
                  <button 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-medium shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    onClick={() => router.push("/course")}
                  >
                    Browse Courses
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

     
      { /* Watch History*/}
      <HistorySlider></HistorySlider>
      {/* Purchased Courses */}
      {purchasedCourse.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-pink-100">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Continue Learning</h2>
            <div className="relative">
              <button 
                onClick={() => scrollLeft(scrollContainerRef)}
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => scrollRight(scrollContainerRef)}
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide"
              >
                {purchasedCourse.map((course) => (
                  <div key={course.id} className="flex-shrink-0 w-50">
                    <Card
                      id={course?.id}
                      imageUrl={course.imageUrl}
                      title={course.title}
                      instructor={course.instructor}
                      price={course.price}
                      rating={4.5}
                      totalRatings={0}
                      discountedPrice={course.price}
                      isWishlisted={false}
                      onWishlistToggle={() => {}}
                      isPurchased={true}
                      showWishlist={false}
                      showRatings={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses of Interest */}
      { categoryCourses.length > 0 && 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-pink-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Courses of your Interest 
          </h2>
          
          {!courseCategoryLoading ? (
            categoryCourses.length > 0 ? (
              <div className="relative">
                <button 
                  onClick={() => scrollLeft(interestContainerRef)}
                  className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => scrollRight(interestContainerRef)}
                  className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
                  >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div 
                  ref={interestContainerRef}
                  className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide"
                  >
                  {categoryCourses.map((course) => (
                    <div key={course.id} className="flex-shrink-0 w-50">
                      <Card
                        id={course?.id}
                        imageUrl={course.imageUrl}
                        title={course.title}
                        instructor={course.instructor}
                        price={course.price}
                        rating={course.averageRating || 0}
                        totalRatings={course.totalRatings || 0}
                        discountedPrice={course.price}
                        isWishlisted={isWishlisted(course.id)}
                        onWishlistToggle={() => {}}
                        isPurchased={isPurchased(course?.id)}
                        />
                    </div>
                  ))}
                  {courseCategoryLoading && hasMoreInterest && (
                    <div className="flex-shrink-0 w-50 flex items-center justify-center">
                      <LoadingSpinner height="h-8" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-full text-center py-8">
                <p className="text-pink-600 text-lg">No courses found</p>
              </div>
            )
          ) : (
            <div className="flex-shrink-0 w-full text-center py-8">
              <LoadingSpinner height="h-30" />
            </div>
          )}
        </div>
      </div>
    }

      {/* All Courses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
          {/* Categories */}
          <div className="relative mb-6 sm:mb-8 p-6 sm:p-8 pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Explore Categories</h2>
            <button 
              onClick={scrollCategoriesLeft}
              className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={scrollCategoriesRight}
              className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div 
              ref={categoriesContainerRef}
              className="flex overflow-x-auto pb-2 scrollbar-hide"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-6 py-3 mr-4 rounded-full whitespace-nowrap flex-shrink-0 font-medium transition-all duration-200 transform hover:scale-105 ${
                    activeTab === category.id 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-pink-700 border border-pink-200'
                  }`}
                  onClick={() => { 
                    setActiveTab(category.id);
                    setCategory(category.id);
                    setCourses([]);
                    setAllCoursesPage(1);
                    setHasMoreAllCourses(true);
                    fetchCourses(1, true);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* All Courses */}
          <div className="relative p-6 sm:p-8 pt-0">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">All Courses</h3>
            <div className="relative">
              <button 
                onClick={() => scrollLeft(coursesContainerRef)}
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => {
                  scrollRight(coursesContainerRef);
                  if (hasMoreAllCourses) {
                    setLoadMore(true);
                  }
                }}
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div 
                ref={coursesContainerRef}
                className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide"
              >
                {!courseLoading ? (
                  courses.length > 0 ? (
                    <>
                      {courses.map((course) => (
                        <div key={course.id} className="flex-shrink-0 w-50 gap-1">
                          <Card
                            id={course.id}
                            imageUrl={course.imageUrl}
                            title={course.title}
                            instructor={course.instructor}
                            price={course.price}
                            rating={course.rating || 0}
                            totalRatings={course.totalRatings || 0}
                            discountedPrice={course.price}
                            isWishlisted={isWishlisted(course.id) || false}
                            onWishlistToggle={() => {}}
                            isPurchased={isPurchased(course?.id)}
                          />
                        </div>
                      ))}
                      {loadMore && hasMoreAllCourses && (
                        <div className="flex-shrink-0 w-50 flex items-center justify-center">
                          <LoadingSpinner height="h-8" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-shrink-0 w-full text-center py-8">
                      <p className="text-pink-600 text-lg">No courses found</p>
                    </div>
                  )
                ) : (
                  <div className="flex-shrink-0 w-full text-center py-8">
                    <LoadingSpinner height="h-30" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Sections */}
{features.map((feature, index) => (
  <center key={index}>
    <div 
      key={index} 
      className={`py-8 lg:py-16 ${index % 2 === 0 ? 'bg-gradient-to-r from-pink-50 to-rose-50' : 'bg-white'} rounded-xl my-6`}
      style={{ minHeight: '400px', width: "90%" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* TEXT SECTION */}
          <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              {feature.title}
            </h2>
            <p className="text-gray-700 text-base sm:text-lg mb-6">
              {feature.description}
            </p>
          </div>
          
          {/* IMAGE SECTION - Modified for better mobile display */}
          <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className="relative w-full h-auto aspect-video max-h-60 lg:max-h-80 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src={feature.image}
                alt={feature.title}
                width={600} 
                height={400} 
                className="object-cover w-full h-full"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 600px"
                priority={index === 0}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  </center>
))}

    </div>
  );
};

export default HomePage;