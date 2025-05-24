'use client';
import Image from 'next/image';
import { Settings, Bookmark, Award, User, Mail, Calendar, Plus } from 'lucide-react';
import Card from '@/components/Card';
import { useEffect, useState, useMemo } from 'react';
import { PageLoading } from '@/components/PageLoading';
import UserNav from '@/components/Navbar/UserNav';
import { useEducator} from '@/context/educatorContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormattedDate from '@/components/FormattedDate';

export default function EducatorProfile() {
  const { educator, educatorLoading } = useEducator();
  const [pageLoading, setPageLoading] = useState(false);
  const router = useRouter(); 
  useEffect(() => {
    console.log(educator); 
    setPageLoading(educatorLoading);
  }, [educatorLoading, educator]);

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
      avatar: "/avatar-placeholder.jpg",
      role: "Educator",
      bio: ""
    };
        return {
      name: educator.username || "Educator Name",
      email: educator.email || "No email provided",
      phone: educator.mobile || "No phone provided",
      teachingFocus : educator.teachingFocus || ["Not Provided"],
      joinDate: `Joined ${new Date(educator.date || educator.createdAt || Date.now()).toLocaleDateString()}`,
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
      coverImage: "/cover-placeholder.jpg", // Add default cover image
      avatar: "/avatar-placeholder.jpg", // Add default avatar
      role: educator.role || "Educator",
      bio: educator.bio 
    };
  }, [educator]);

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
            src={formattedEducator.coverImage}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Profile Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
              <Image
                src={formattedEducator.avatar}
                alt={formattedEducator.name}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{formattedEducator.name}</h1>
                  <p className="text-blue-600 font-medium">{formattedEducator.role}</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition">
                    <Settings size={16} />
                    <Link href="profile/settings">
                    Settings
                    </Link>
                  </button>
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                    <Bookmark size={16} />
                    Bookmarks
                  </button>
                </div>
              </div>

              <p className="mt-3 text-gray-600">{formattedEducator.bio}</p>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={16} className="text-blue-500" />
                  <span>{formattedEducator.stats.studentsEnrolled} students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Award size={16} className="text-blue-500" />
                  <span>{formattedEducator.stats.certificatesIssued} certificates</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Bookmark size={16} className="text-blue-500" />
                  <span>{formattedEducator.stats.coursesCreated} courses</span>
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
                <p className="text-sm text-gray-600">{formattedEducator.email}</p>
                <p className="text-sm text-gray-600">{formattedEducator.phone}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                Account Information
              </h3>
              <FormattedDate isoString={formattedEducator.joinDate}></FormattedDate>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Teaching Focus</h3>

              {
                formattedEducator.teachingFocus.map((focus, key: number) => {
                  const colors = [
                    'bg-blue-500', 
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-teal-500'
                  ];
                  
                  // Select color based on index (cycles through the array)
                  const colorClass = colors[key % colors.length];

                  return (
                    <div className="space-y-2" key={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                        <p className="text-sm text-gray-600">{focus}</p>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* My Courses */}
          <div className="mt-12">
            <div className='flex items-center justify-between gap-4'>
              <h2 className="text-xl font-bold text-gray-900 mb-6">My Courses</h2>
                  <button 
                    onClick={() => router.push(`/educator/addcourse`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Chapter
                  </button>
              </div>
            {formattedEducator.courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 place-items-center">
                {formattedEducator.courses.map(course => (
                  <Card
                    key={course._id}
                    id={course._id}
                    imageUrl={course.courseImage || "/course-placeholder.jpg"}
                    title={course.title}
                    instructor={formattedEducator.name}
                    rating={4.5} // You might want to add ratings to your course model
                    totalRatings={0} // Add this to your course model if needed
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
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">You havent created any courses yet.</p>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                 <Link href="/educator/addcourse"> Create Your First Course </Link>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}