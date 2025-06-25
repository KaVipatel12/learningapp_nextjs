'use client';
import Image from 'next/image';
import { Settings, Bookmark, Award, User, Mail, Calendar, Plus } from 'lucide-react';
import Card from '@/components/Card';
import { useEffect, useState, useMemo } from 'react';
import { PageLoading } from '@/components/PageLoading';
import { useEducator} from '@/context/educatorContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormattedDate from '@/components/FormattedDate';

export default function EducatorProfile() {
  const { educator, educatorLoading } = useEducator();
  const [pageLoading, setPageLoading] = useState(false);
  const router = useRouter(); 
  
  useEffect(() => {
    setPageLoading(educatorLoading);
  }, [educatorLoading]);
  
  useEffect(() => {  
  if(educatorLoading) return;   
  else if(!educator && !educatorLoading) return router.push("/unauthorized/user")
}, [router , educator , educatorLoading]);

  const formattedEducator = useMemo(() => {
    if (!educator) return {
      name: "",
      email: "",
      phone: "",
      joinDate: "",
      teachingFocus : [],
      stats: {
        coursesCreated: 0,
        studentsEnrolled: 0,
        certificatesIssued: 0
      },
      courses: [],
      coverImage: "/cover-placeholder.jpg",
      avatar: "/profilepic.png",
      role: "Educator",
      bio: ""
    };
    
    return {
      name: educator.username || "Educator Name",
      email: educator.email || "No email provided",
      phone: educator.mobile || "No phone provided",
      teachingFocus : educator.teachingFocus || ["Not Provided"],
      joinDate: educator.date || educator.createdAt || Date.now(),
      stats: {
        coursesCreated: educator.courses?.length || 0,
        studentsEnrolled: educator.courses?.reduce(
          (acc, course) => acc + (course.totalEnrollment || 0), 
          0
        ) || 0,
        certificatesIssued: educator.courses?.filter(
          course => course.certification
        ).length || 0
      },
      courses: educator.courses || [],
      coverImage: "/cover-placeholder.jpg",
      avatar: "/profilepic.png",
      role: educator.role || "Educator",
      bio: educator.bio 
    };
  }, [educator]);

  if (pageLoading) {
    return (
      <>
        <PageLoading />
      </>
    );
  }
  
  return (
    <>
      <div className="min-h-screen pb-12">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-500">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 via-transparent to-transparent" />
          <Image
            src={formattedEducator.coverImage}
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
                src={formattedEducator.avatar}
                alt={formattedEducator.name}
                width={128}
                height={128}
                className="object-cover relative z-10"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-rose-900">{formattedEducator.name}</h1>
                  <p className="text-rose-600 font-medium">{formattedEducator.role}</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-white hover:bg-rose-50 px-4 py-2 rounded-full text-sm font-medium transition text-rose-700 border border-rose-200 shadow-sm">
                    <Settings size={16} />
                    <Link href="profile/settings">
                      Settings
                    </Link>
                  </button>
                </div>
              </div>

              <p className="mt-3 text-rose-800/80">{formattedEducator.bio}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center gap-2 text-rose-800">
                  <User size={16} className="text-rose-500" />
                  <span>{formattedEducator.stats.studentsEnrolled} students</span>
                </div>
                <div className="flex items-center gap-2 text-rose-800">
                  <Award size={16} className="text-rose-500" />
                  <span>{formattedEducator.stats.certificatesIssued} certificates</span>
                </div>
                <div className="flex items-center gap-2 text-rose-800">
                  <Bookmark size={16} className="text-rose-500" />
                  <span>{formattedEducator.stats.coursesCreated} courses</span>
                </div>
              </div>
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
                <p className="text-sm text-rose-800">{formattedEducator.email}</p>
                <p className="text-sm text-rose-800">{formattedEducator.phone}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
              <h3 className="font-medium text-rose-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-rose-500" />
                Account Information
              </h3>
              {formattedEducator.joinDate && (
                <FormattedDate isoString={formattedEducator.joinDate} />
              )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
              <h3 className="font-medium text-rose-900 mb-3">Teaching Focus</h3>
              {formattedEducator?.teachingFocus?.map((focus, key: number) => {
                const colors = [
                  'bg-pink-500', 
                  'bg-rose-500',
                  'bg-fuchsia-500',
                  'bg-purple-500',
                  'bg-violet-500'
                ];
                const colorClass = colors[key % colors.length];

                return (
                  <div className="space-y-2" key={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                      <p className="text-sm text-rose-800">{focus}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Courses */}
          <div className="mt-12">
            <div className='flex items-center justify-between gap-4 mb-6'>
              <h2 className="text-xl font-bold text-rose-900">My Courses</h2>
              <button 
                onClick={() => router.push(`/educator/addcourse`)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md hover:to-rose-600 transition-all shadow-md flex items-center gap-1"
              >
                <Plus size={16} />
                Add Chapter
              </button>
            </div>
            
            {formattedEducator.courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {formattedEducator.courses.map(course => (
                  <Card
                    key={course._id}
                    id={course._id}
                    imageUrl={course.imageUrl || "/course-placeholder.jpg"}
                    title={course.title}
                    instructor={formattedEducator.name}
                    rating={4.5}
                    totalRatings={0}
                    price={course.price}
                    discountedPrice={course.price - (course.price * (course.discount || 0) / 100)}
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
        </div>
      </div>
    </>
  );
}