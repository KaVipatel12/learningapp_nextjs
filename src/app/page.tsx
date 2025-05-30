'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import UserNav from '@/components/Navbar/UserNav';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Course, useUser } from '@/context/userContext';
import { useRouter } from 'next/navigation';


interface Category {
  id: string;
  name: string;
}

export interface PopulatedCourse {
  
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  educatorName: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  totalRatings: number;
  // Include other fields as needed
}

export interface WishList {
  id: string;
}

interface Feature {
  title: string;
  description: string;
  image: string;
}

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const { user, userLoading, purchasedCoursesIds , purchasedCourses } = useUser(); 
  const [purchasedCourse, setPurchasedCourse] = useState<Course[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const coursesContainerRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoryCourses, setCategoryCourses] = useState<Course[]>([]);
  const [category, setCategory] = useState<string>("")
  const [courseLoading, setCourseLoading] = useState<boolean>(false)
  const [courseCategoryLoading, setCourseCategoryLoading] = useState<boolean>(true)
  const [userWishlist , setUserWishList] = useState<WishList[]>([])
  const router = useRouter(); 
  // Carousel images
  const carouselImages: string[] = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1422&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80'
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

  // Receiving the purchased courses and wishlist. 
useEffect(() => {
  if (userLoading) return;
  if(purchasedCourses.length > 0){
    setPurchasedCourse(purchasedCourses); 
  }
  if (user?.wishlist) {
    const userWishlist = user.wishlist.map(id => id);
    setUserWishList(userWishlist); 
  }
}, [user, userLoading, purchasedCourses]);


const fetchCourseByCategory = async () => {
    setCourseCategoryLoading(true);

    console.log("loading"); 
    try {

      const response = await fetch(`/api/course/fetchcourse/fetchbycategory`);

      if (!response.ok) {
        console.log("Error in fetching course")
      }

      const data = await response.json();

      console.log("category course" + data.msg)
      if (Array.isArray(data.msg)) {
        const formattedCourses = data.msg.map((course: Course) => ({
          id: course._id,
          imageUrl: course.courseImg,
          title: course.title,
          instructor: course.educatorName || 'Unknown Instructor',
          price: course.price,
          rating : course.averageRating ,
          totalRatings : course.totalRatings,
          educatorName: course.educatorName || ''
        }));

        setCategoryCourses(formattedCourses);
      } else {
        console.warn("Unexpected response format:", data);
        setCategoryCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCategoryCourses([]);
    } finally {
      setCourseCategoryLoading(false);
    }
}

useEffect(() => {
  fetchCourseByCategory();
}, []);

  const fetchCourses = useCallback(async () => {
    setCourseLoading(true);

    const effectiveCategory: string = category === "all" ? "" : category;

    try {
      const endpoint =
        effectiveCategory.length === 0
          ? "/api/course/fetchcourse"
          : `/api/course/fetchcourse?category=${encodeURIComponent(effectiveCategory)}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        console.log("Error in fetching course")
      }

      const data = await response.json();

      if (Array.isArray(data.msg)) {
        const formattedCourses = data.msg.map((course: Course) => ({
          id: course._id,
          imageUrl: '/default-course.jpg',
          title: course.title,
          instructor: course.educatorName || 'Unknown Instructor',
          price: course.price,
          rating : course.averageRating ,
          totalRatings : course.totalRatings,
          educatorName: course.educatorName || ''
        }));

        setCourses(formattedCourses);
      } else {
        console.warn("Unexpected response format:", data);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setCourseLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  // Features sections
  const features: Feature[] = [
    {
      title: 'Learn Anything',
      description: 'Access 5000+ courses across all categories',
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80'
    },
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1588&q=80'
    }
  ];

  // Scroll functions for horizontal containers
  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null >) => {
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
      categoriesContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollCategoriesRight = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const isWishlisted = (courseId : string) => {
    return userWishlist.some(id  => id.toString() === courseId)
  }
  const isPurchased = (courseId : string) => {
    return purchasedCoursesIds.some(id  => id.toString() === courseId)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white">
      {/* Navbar */}
      <UserNav />

      <div className="relative h-96 w-full overflow-hidden">
        <div className="flex h-full transition-transform duration-500 ease-in-out">
          {carouselImages.map((img, index) => (
            <div key={index} className="min-w-full h-full">
              <Image
                src={img}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 via-rose-800/40 to-purple-900/60 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">Start Learning Today</h1>
                  <p className="text-xl mb-6 drop-shadow-md">Unlock your potential with our expert-led courses</p>
                  <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-xl font-medium shadow-xl transform hover:scale-105 transition-all duration-200" onClick={() => {router.push("/course")}}>
                    Browse Courses
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchased Courses (Horizontal Scroll) */}
  {
    purchasedCourse.length > 0 && (
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Continue Learning</h2>
          <div className="relative">
            {/* Scroll buttons (hidden on mobile) */}
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
            
            {/* Horizontal scroll container */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide"
            >

               { purchasedCourse.map((course) => (
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


    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Courses of your Interest</h2>
    {
      !courseCategoryLoading ? 
      (
      categoryCourses.length > 0 && (
          <div className="relative">
            {/* Scroll buttons (hidden on mobile) */}
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
            
            {/* Horizontal scroll container */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide"
            >

               { categoryCourses.map((course) => (
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
            </div>
          </div>
      )
      ) : (
         <div className="flex-shrink-0 w-full text-center py-8">
          <LoadingSpinner height='h-30'></LoadingSpinner>
        </div>
      )
    }
      </div>
    </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100">
          {/* Categories with scroll buttons */}
          <div className="relative mb-8 p-8 pb-4">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Explore Categories</h2>
            {/* Scroll buttons */}
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
            
            {/* Horizontal scroll container for categories */}
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
                    setActiveTab(category.id) 
                    setCategory(category.id)
                   }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* All Courses (Horizontal Scroll) */}
          <div className="relative p-8 pt-0">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">All Courses</h3>
            <div className="relative">
              {/* Scroll buttons (hidden on mobile) */}
              <button 
                onClick={() => scrollLeft(coursesContainerRef)}
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => scrollRight(coursesContainerRef)}
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-2 shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-110 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Horizontal scroll container */}
              <div 
                ref={coursesContainerRef}
                className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide"
              >
                {
                !courseLoading ? (
                 courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course.id} className="flex-shrink-0 w-50 gap-1">
                      <Card
                        id={course.id}
                        imageUrl={course.imageUrl}
                        title={course.title}
                        instructor={course.instructor}
                        price={course.price}
                        rating={course.rating || 0}
                        totalRatings={course.totalRatings  || 0}
                        discountedPrice={course.price}
                        isWishlisted={isWishlisted(course.id) || false}
                        onWishlistToggle={() => {}}
                        isPurchased={isPurchased(course?.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex-shrink-0 w-full text-center py-8">
                    <p className="text-pink-600 text-lg"> No course found </p>
                  </div>
                )) : (
                   <div className="flex-shrink-0 w-full text-center py-8">
                    <LoadingSpinner height='h-30'></LoadingSpinner>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Sections */}
      {features.map((feature, index) => (
        <div key={index} className={`py-16 ${index % 2 === 0 ? 'bg-gradient-to-r from-pink-50 to-rose-50' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className={`md:w-1/2 ${index % 2 === 0 ? 'order-1' : 'order-2'}`}>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{feature.title}</h2>
              <p className="text-gray-700 text-lg mb-6">{feature.description}</p>
              <button className="text-pink-600 font-medium hover:text-pink-700 flex items-center bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-2 rounded-lg border border-pink-200 hover:border-pink-300 transition-all duration-200">
                Learn more <ChevronRight className="ml-1 w-4 h-4" />
              </button>
            </div>
            <div className={`md:w-1/2 ${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-900 via-rose-800 to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">LearnHub</h3>
              <p className="text-pink-200">Empowering learners worldwide since 2023</p>
            </div>
            {/* Add more footer columns as needed */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;