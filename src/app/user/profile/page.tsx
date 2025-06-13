'use client';

import Image from 'next/image';
import { Settings, Mail, Calendar, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Card from '@/components/Card';
import { UserData, useUser } from '@/context/userContext';
import { PageLoading } from '@/components/PageLoading';
import FormattedDate from '@/components/FormattedDate';
import Link from 'next/link';

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
        <PageLoading />
      </>
    );
  }

  return (
    <>
      <div className="bg-pink-50 min-h-screen pb-12">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-500">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 via-transparent to-transparent" />
          <Image
            src="/cover.jpg" // Replace with a valid image URL or local path
            alt="Cover photo"
            fill
            className="object-cover opacity-70"
            priority
          />
        </div>

        {/* Profile Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-rose-300 opacity-30" />
              <Image
                src="/avatar.jpg" // Replace with a valid image URL or local path
                alt="User profile"
                width={128}
                height={128}
                className="object-cover relative z-10"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-rose-900">
                    {userData?.username}
                  </h1>
                  <p className="text-rose-600 font-medium">{userData?.role}</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-white hover:bg-rose-50 px-4 py-2 rounded-full text-sm font-medium transition text-rose-700 border border-rose-200 shadow-sm">
                    <Settings size={16} />
                    <Link href={"profile/settings"}>
                      Settings
                    </Link>
                  </button>
                  <button
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 text-white px-4 py-2 rounded-full text-sm font-medium transition shadow-md"
                    onClick={() => router.push('/user/wishlist')}
                  >
                    <Heart size={16} className="fill-white" />
                    Wishlist
                  </button>
                </div>
              </div>
              <p className="mt-3 text-rose-800/80">{user?.bio}</p>
            </div>
          </div>

          {/* Contact & Account Info + Goals */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
              <h3 className="font-medium text-rose-900 mb-3 flex items-center gap-2">
                <Mail size={16} className="text-rose-500" />
                Contact Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-rose-800">{user?.email}</p>
                <p className="text-sm text-rose-800">{user?.mobile}</p>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
              <h3 className="font-medium text-rose-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-rose-500" />
                Account Information
              </h3>
              <div className="space-y-2">
                {user?.date && <FormattedDate isoString={user.date as string} />}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
              <h3 className="font-medium text-rose-900 mb-3">Learning Goals</h3>
              <div className="space-y-2">
                {userData?.category?.map((cat, key) => {
                  const colors = [
                    'bg-pink-500', 
                    'bg-rose-500',
                    'bg-fuchsia-500',
                    'bg-purple-500',
                    'bg-violet-500'
                  ];
                  const colorClass = colors[key % colors.length];
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                      <p className="text-sm text-rose-800">{cat}</p>
                    </div>
                  )})}
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-rose-900">Enrolled Courses</h2>
              {purchasedCourses && purchasedCourses.length > 6 && (
                <button 
                  className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                  onClick={() => router.push('/user/courses')}
                >
                  View All →
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 place-items-center">
              {purchasedCourses?.slice(0, 6).map((course) => (
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