'use client';

import Image from 'next/image';
import { Settings, Mail, Calendar, Heart, Bookmark, Award, User, Plus, HistoryIcon  } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Card from '@/components/Card';
import { useUser } from '@/context/userContext';
import { PageLoading } from '@/components/PageLoading';
import FormattedDate from '@/components/FormattedDate';

export default function CombinedProfile() {
  const router = useRouter();
  const { user, userLoading, purchasedCourses } = useUser();
  const [pageLoading, setPageLoading] = useState(true);

  const isEducator = user?.role === 'educator';

  useEffect(() => {
    setPageLoading(userLoading);
  }, [userLoading]);

  const profileData = useMemo(() => {
    if (!user) return null;

    if (isEducator) {
      return {
        name: user.username || "Educator Name",
        email: user.email || "No email provided",
        phone: user.mobile || "No phone provided",
        teachingFocus: user.teachingFocus || ["Not Provided"],
        joinDate: user.date || user.createdAt || Date.now(),
        stats: {
          coursesCreated: user.courses?.length || 0,
          studentsEnrolled: user.courses?.reduce(
            (acc: number, course) => acc + (course.totalEnrollment || 0), 
            0
          ) || 0,
          certificatesIssued: user.courses?.filter(
            (course) => course.certification
          ).length || 0
        },
        courses: user.courses || [],
        purchasedCourses: purchasedCourses || [],
        coverImage: "/cover-placeholder.jpg",
        avatar: "/profilepic.png",
        role: user.role || "Educator",
        bio: user.bio || ""
      };
    } else {
      return {
        name: user.username || "User Name",
        email: user.email || "No email provided",
        phone: user.mobile || "No phone provided",
        joinDate: user.date || "",
        categories: user.category || [],
        purchasedCourses: purchasedCourses || [],
        coverImage: "/cover-placeholder.jpg",
        avatar: "/profilepic.png",
        role: user.role || "Student",
        bio: user.bio || ""
      };
    }
  }, [user, purchasedCourses, isEducator]);

  if (pageLoading) {
    return <PageLoading />;
  }

  if (!user) {
    router.push('/unauthorized');
    return null;
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-500">
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 via-transparent to-transparent" />
        <Image
          src={profileData?.coverImage || "/cover-placeholder.jpg"}
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
              src={profileData?.avatar || "/profilepic.png"}
              alt={profileData?.name || "Profile"}
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
                  {profileData?.name}
                </h1>
                <p className="text-rose-600 font-medium">{profileData?.role === "educator" ? "Educator" : "Student"}</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white hover:bg-rose-50 px-4 py-2 rounded-full text-sm font-medium transition text-rose-700 border border-rose-200 shadow-sm">
                  <Settings size={16} />
                  <Link href="profile/settings">
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
                <button className="flex items-center gap-2 bg-white hover:bg-rose-50 px-4 py-2 rounded-full text-sm font-medium transition text-rose-700 border border-rose-200 shadow-sm">
                  <HistoryIcon size={16} />
                  <Link href="/user/quizes">
                    Quizes
                  </Link>
                </button>
              </div>
            </div>
            <p className="mt-3 text-rose-800/80">{profileData?.bio}</p>

            {/* Stats - Only for Educators */}
            {isEducator && (
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center gap-2 text-rose-800">
                  <User size={16} className="text-rose-500" />
                  <span>{profileData?.stats?.studentsEnrolled} students</span>
                </div>
                <div className="flex items-center gap-2 text-rose-800">
                  <Award size={16} className="text-rose-500" />
                  <span>{profileData?.stats?.certificatesIssued} certificates</span>
                </div>
                <div className="flex items-center gap-2 text-rose-800">
                  <Bookmark size={16} className="text-rose-500" />
                  <span>{profileData?.stats?.coursesCreated} courses</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
            <h3 className="font-medium text-rose-900 mb-3 flex items-center gap-2">
              <Mail size={16} className="text-rose-500" />
              Contact Information
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-rose-800">{profileData?.email}</p>
              <p className="text-sm text-rose-800">{profileData?.phone}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
            <h3 className="font-medium text-rose-900 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-rose-500" />
              Account Information
            </h3>
            {profileData?.joinDate && (
              <FormattedDate isoString={profileData.joinDate} />
            )}
          </div>

          {/* Teaching Focus / Learning Goals Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
            <h3 className="font-medium text-rose-900 mb-3">
              {isEducator ? "Teaching Focus" : "Learning Goals"}
            </h3>
            <div className="space-y-2">
              {(isEducator ? profileData?.teachingFocus : profileData?.categories)?.map((item: string, index: number) => {
                const colors = [
                  'bg-pink-500', 
                  'bg-rose-500',
                  'bg-fuchsia-500',
                  'bg-purple-500',
                  'bg-violet-500'
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div key={`${index}`} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                    <p className="text-sm text-rose-800">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Courses Section */}
        {isEducator && (
          <div className="mt-12">
            <div className='flex items-center justify-between gap-4 mb-6'>
              <h2 className="text-xl font-bold text-rose-900">My Courses</h2>
              <button 
                onClick={() => router.push(`/educator/addcourse`)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md hover:to-rose-600 transition-all shadow-md flex items-center gap-1"
              >
                <Plus size={16} />
                Add Course
              </button>
            </div>
            
            {profileData?.courses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 place-items-center">
                {profileData?.courses?.map((course) => (
                  <Card
                    key={course._id}
                    id={course._id}
                    imageUrl={course.imageUrl || "/course-placeholder.jpg"}
                    title={course.title}
                    instructor={profileData.name}
                    rating={course.averageRating || 0}  // Ensure rating has a default value
                    totalRatings={course.totalRatings || 0}  // Ensure totalRatings has a default value
                    price={course.price || 0}  // Ensure price has a default value
                    discountedPrice={course.discount ? 
                      (course.price || 0) - ((course.price || 0) * (course.discount || 0) / 100) : 
                      (course.price || 0)}
                    isWishlisted={false}
                    onWishlistToggle={() => {}}
                    showWishlist={false}
                    showRatings={false}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-rose-100 text-center">
                <p className="text-rose-800/80">You have not created any courses yet.</p>
                <button 
                  onClick={() => router.push('/educator/addcourse')}
                  className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-md"
                >
                  Create Your First Course
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enrolled Courses - For both but shown differently */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-rose-900">
              {isEducator ? "Purchased Courses" : "Enrolled Courses"}
            </h2>
          </div>
          
          {profileData?.purchasedCourses?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 place-items-center">
              {profileData.purchasedCourses.slice(0, 6).map((course) => (
                <Card
                  key={course.id}
                  id={course.id}
                  imageUrl={course.imageUrl || '/default-course.jpg'}
                  title={course.title}
                  instructor={course.instructor}
                  price={course.price || 0}  // Ensure price has a default value
                  rating={course.averageRating || 0}  // Ensure rating has a default value
                  totalRatings={course.totalRatings || 0}  // Ensure totalRatings has a default value
                  discountedPrice={course.price || 0}  // Ensure discountedPrice has a default value
                  isWishlisted={false}
                  onWishlistToggle={() => {}}
                  isPurchased={true}
                  showWishlist={false}
                  showRatings={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-rose-100 text-center">
              <p className="text-rose-800/80">
                {isEducator 
                  ? "You haven't purchased any courses yet." 
                  : "You have not enrolled in any courses yet."}
              </p>
              <button 
                onClick={() => router.push('/course')}
                className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-md"
              >
                Explore courses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}