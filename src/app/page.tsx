'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import UserNav from '@/components/Navbar/UserNav';
import Card from '@/components/Card';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Carousel images
  const carouselImages = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1422&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80'
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'tech', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'design', name: 'Design' },
    { id: 'science', name: 'Science' },
  ];

  // Dummy purchased courses (horizontal scroll)
  const purchasedCourses = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      title: 'Advanced JavaScript',
      instructor: 'Alex Johnson',
      price: 149,
      progress: 65
    },
    // Add more purchased courses...
  ];

  // All courses data
  const allCourses = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      title: 'React Masterclass',
      instructor: 'Sarah Miller',
      price: 199,
      discountedPrice: 149,
      rating: 4.8,
      totalRatings: 1245
    },
    // Add more courses...
  ];

  // Features sections
  const features = [
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

  // Scroll functions for horizontal container
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <UserNav />
      
      {/* Hero Carousel */}
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
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-4xl font-bold mb-4">Start Learning Today</h1>
                  <p className="text-xl mb-6">Unlock your potential with our expert-led courses</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                    Browse Courses
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchased Courses (Horizontal Scroll) */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
        <div className="relative">
          {/* Scroll buttons (hidden on mobile) */}
          <button 
            onClick={scrollLeft}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={scrollRight}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Horizontal scroll container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide" // scrollbar-hide can be a CSS utility
          >
            {purchasedCourses.map((course) => (
              <div key={course.id} className="flex-shrink-0 w-80">
                <Card
                  id={course.id}
                  imageUrl={course.imageUrl}
                  title={course.title}
                  instructor={course.instructor}
                  price={course.price}
                  key={course.id}
                  rating={4.5} // You might want to add ratings to your course model
                  totalRatings={0} // Add this to your course model if needed
                  discountedPrice={course.price}
                  isWishlisted={false}
                  onWishlistToggle={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-6 py-2 mr-4 rounded-full whitespace-nowrap flex-shrink-0 ${
                activeTab === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allCourses.map((course) => (
            <Card
              key={course.id}
              id={course.id}
              imageUrl={course.imageUrl}
              title={course.title}
              instructor={course.instructor}
              price={course.price}
              discountedPrice={course.discountedPrice}
              rating={course.rating}
              totalRatings={course.totalRatings}
            />
          ))}
        </div>
      </div>

      {/* Features Sections */}
      {features.map((feature, index) => (
        <div key={index} className={`py-16 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className={`md:w-1/2 ${index % 2 === 0 ? 'order-1' : 'order-2'}`}>
              <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
              <p className="text-gray-600 text-lg mb-6">{feature.description}</p>
              <button className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
                Learn more <ChevronRight className="ml-1 w-4 h-4" />
              </button>
            </div>
            <div className={`md:w-1/2 ${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LearnHub</h3>
              <p className="text-gray-400">Empowering learners worldwide since 2023</p>
            </div>
            {/* Add more footer columns as needed */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;