'use client';
import Image from 'next/image';
import { Bookmark, Award, User, Mail, Calendar, GraduationCap } from 'lucide-react';
import Card from '@/components/Card';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { PageLoading } from '@/components/PageLoading';
import { useParams, useRouter } from 'next/navigation';
import FormattedDate from '@/components/FormattedDate';
import { EducatorData, useEducator } from '@/context/educatorContext';

export default function EducatorProfile() {
  const [educatorData, setEducator] = useState<EducatorData>();
  const { id } = useParams();
  const { educator, educatorLoading } = useEducator(); 
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if(educator && !educatorLoading){
      if(educator._id === id) return router.push(`/profile/educator`)
    }
  }, [educator, educatorLoading, router, id])

  const fetchEducator = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await fetch(`/api/educator/fetcheducatordata/${id}`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.msg);
        return router.back();
      }

      setEducator(data.msg);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
      router.back();
    } finally {
      setPageLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchEducator();
  }, [fetchEducator]);

  const formattedEducator = useMemo(() => {
    if (!educatorData) return null;
    return {
      name: educatorData?.username || 'Educator Name',
      email: educatorData?.email || 'No email provided',
      phone: educatorData?.mobile || 'No phone provided',
      joinDate: educatorData?.date || educatorData?.createdAt || Date.now(),
      teachingFocus: educatorData?.teachingFocus || ['Not Provided'],
      stats: {
        coursesCreated: educatorData?.courses?.length || 0,
        studentsEnrolled:
          educatorData?.courses?.reduce((acc, course) => acc + (course.totalEnrollment || 0), 0) || 0,
        certificatesIssued: educatorData?.courses?.filter(course => course.certification).length || 0,
      },
      courses: educatorData?.courses || [],
      coverImage: '/cover-placeholder.jpg',
      avatar: '/avatar-placeholder.jpg',
      role: educatorData?.role || 'Educator',
      bio: educatorData?.bio || '',
    };
  }, [educatorData]);

  if (pageLoading || !formattedEducator) {
    return <PageLoading />;
  }

  return (
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
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
                <p className="text-rose-600 font-medium flex items-center">
                  <GraduationCap className="mr-1 h-4 w-4" /> 
                  {formattedEducator.role}
                </p>
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

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Info */}
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

          {/* Account Info */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
            <h3 className="font-medium text-rose-900 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-rose-500" />
              Account Information
            </h3>
            {formattedEducator.joinDate && (
              <FormattedDate isoString={formattedEducator.joinDate} />
            )}
          </div>

          {/* Teaching Focus */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100">
            <h3 className="font-medium text-rose-900 mb-3">Teaching Focus</h3>
            {formattedEducator?.teachingFocus?.map((focus, key: number) => {
              const colors = ['bg-pink-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-purple-500', 'bg-violet-500'];
              const colorClass = colors[key % colors.length];
              return (
                <div key={key} className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                  <p className="text-sm text-rose-800">{focus}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-rose-900 mb-6">Courses</h2>
          
          {formattedEducator.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {formattedEducator.courses.map(course => (
                <Card
                  key={course._id}
                  id={course._id}
                  imageUrl={course.courseImage || '/course-placeholder.jpg'}
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
              <p className="text-rose-800/80">This educator has not created any courses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}