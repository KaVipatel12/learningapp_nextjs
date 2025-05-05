'use client';
import Image from 'next/image';
import { Edit, Settings, Bookmark, Clock, Award, User, Mail, Calendar } from 'lucide-react';
import Card from '@/components/Card';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/PageLoading';
import UserNav from '@/components/Navbar/UserNav';
import { useEducator } from '@/context/educatorContext';

export default function UserProfile() {
  const {loading } = useEducator();
  const [pageLoading, setPageLoading ] = useState(false)
  const user = {
    name: "Alex Johnson",
    role: "Premium Student",
    bio: "Passionate about web development and UX design. Currently learning advanced React patterns.",
    avatar: "/user-avatar.jpg", // Replace with actual image path
    coverImage: "/profile-cover.jpg", // Replace with actual image path
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    joinDate: "Joined January 2023",
    stats: {
      coursesCompleted: 12,
      hoursLearned: 86,
      certificates: 5
    }
  };

  useEffect(() => {
      setPageLoading(loading)
  }, [loading])

  // Hardcoded enrolled courses
  const enrolledCourses = [
    {
      id: "1",
      imageUrl: "/course1.jpg",
      title: "Advanced React Patterns",
      instructor: "Sarah Miller",
      rating: 4.8,
      totalRatings: 1245,
      price: 99.99,
      discountedPrice: 79.99,
      isWishlisted: false
    },
    {
      id: "2",
      imageUrl: "/course2.jpg",
      title: "UI/UX Design Fundamentals",
      instructor: "David Chen",
      rating: 4.6,
      totalRatings: 892,
      price: 89.99,
      isWishlisted: true
    },
    {
      id: "3",
      imageUrl: "/course3.jpg",
      title: "Node.js Backend Mastery",
      instructor: "Emma Wilson",
      rating: 4.7,
      totalRatings: 1567,
      price: 109.99,
      discountedPrice: 89.99,
      isWishlisted: false
    },
    {
      id: "4",
      imageUrl: "/course4.jpg",
      title: "JavaScript Performance",
      instructor: "Mike Taylor",
      rating: 4.9,
      totalRatings: 2103,
      price: 79.99,
      isWishlisted: true
    }
  ];

  const toggleWishlist = (id: string) => {
    console.log("Toggling wishlist for course:", id);
    // In a real app, you would update state here
  };

  if(pageLoading){
    return (
      <>
      <UserNav />
      <PageLoading></PageLoading>
      </>
  )
  }
  return (
    <>
    <UserNav />
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        <Image
          src={user.coverImage}
          alt="Cover photo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 right-4">
          <button className="flex items-center gap-2 bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition">
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
            <Image
              src={user.avatar}
              alt={user.name}
              width={128}
              height={128}
              className="object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-blue-600 font-medium">{user.role}</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition">
                  <Settings size={16} />
                  Settings
                </button>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                  <Bookmark size={16} />
                  Bookmarks
                </button>
              </div>
            </div>

            <p className="mt-3 text-gray-600">{user?.bio}</p>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={16} className="text-blue-500" />
                <span>{user?.stats.hoursLearned} hours</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Award size={16} className="text-blue-500" />
                <span>{user?.stats.certificates} certificates</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <User size={16} className="text-blue-500" />
                <span>{user?.stats.coursesCompleted} courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              Contact Information
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-600">{user?.phone}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Account Information
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{user?.joinDate}</p>
              <p className="text-sm text-gray-600">Last active: 2 hours ago</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3">Learning Goals</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-sm text-gray-600">Complete React Mastery</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm text-gray-600">Learn Node.js Backend</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <p className="text-sm text-gray-600">UI/UX Certification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Enrolled Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledCourses.map(course => (
              <Card
                key={course.id}
                {...course}
                onWishlistToggle={toggleWishlist}
              />
            ))}
          </div>
        </div>

        {/* Recently Viewed (optional) */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledCourses.slice(0, 2).map(course => (
              <Card
                key={`recent-${course.id}`}
                {...course}
                onWishlistToggle={toggleWishlist}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}