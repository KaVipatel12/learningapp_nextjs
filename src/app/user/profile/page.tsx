'use client';

import Image from 'next/image';
import { Edit, Settings, Bookmark, Mail, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Card from '@/components/Card';
import { UserData, useUser } from '@/context/userContext';
import { PageLoading } from '@/components/PageLoading';
import UserNav from '@/components/Navbar/UserNav';
import FormattedDate from '@/components/FormattedDate';

export default function UserProfile() {
  const { user, userLoading, purchasedCourses } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPageLoading(userLoading);
    if (user) {
      setUserData(user);
    }
  }, [userLoading, user]);

  if (pageLoading) {
    return (
      <>
        <UserNav />
        <PageLoading />
      </>
    );
  }

  return (
    <>
      <UserNav />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <Image
            src="/cover.jpg" // Replace with a valid image URL or local path
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
                src="/avatar.jpg" // Replace with a valid image URL or local path
                alt="User profile"
                width={128}
                height={128}
                className="object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData?.username}
                  </h1>
                  <p className="text-blue-600 font-medium">{userData?.role}</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition">
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
                    onClick={() => router.push('/user/wishlist')}
                  >
                    <Bookmark size={16} />
                    Wishlist
                  </button>
                </div>
              </div>
              <p className="mt-3 text-gray-600">{user?.bio}</p>
            </div>
          </div>

          {/* Contact & Account Info + Goals */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                Contact Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-600">{user?.mobile}</p>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                Account Information
              </h3>
              <div className="space-y-2">
                {user?.date && <FormattedDate isoString={user.date as string} />}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Learning Goals</h3>
              <div className="space-y-2">
                {
                  userData?.category?.map((cat, key) => {
                 
                    const colors = [
                    'bg-blue-500', 
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-teal-500'
                  ];
                    
                    const colorClass = colors[key % colors.length];
                  return (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full  ${colorClass}`} />
                    <p className="text-sm text-gray-600">{cat}</p>
                  </div>
                 )})}
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Enrolled Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center">
              {purchasedCourses?.map((course) => (
                <Card
                  key={course.id}
                  id={course.id}
                  imageUrl={course.imageUrl || '/default-course.jpg'}
                  title={course.title}
                  instructor={course.instructor}
                  price={course.price}
                  rating={course.averageRating || 0}
                  totalRatings={course.totalRatings || 0}
                  discountedPrice={course.price}
                  isWishlisted={false}
                  onWishlistToggle={() => {}}
                  isPurchased={true}
                  showWishlist={false}
                  showRatings={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
