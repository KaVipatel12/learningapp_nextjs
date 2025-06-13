"use client"

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import ReviewsSection from '@/components/course/ReviewSection';
import ChatBox from '@/components/course/ChatBox';
import CourseDescription from '@/components/course/CourseDescription';
import { PageLoading } from '@/components/PageLoading';
import {Dialog , Button , DialogFooter , DialogTitle , DialogHeader , DialogContent} from "@/components/course/ChapterPageFuncs"
import { useRouter } from 'next/navigation';
import { chapterActions } from '@/utils/ChapterFunctionality';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationContext';
import MoreVideos from '@/components/course/MoreVideos';

interface IVideo {
  title: string;
  videoUrl: string;
  videoPublicId: string;
  duration: number;
  _id: string;
}
interface Course{
  educatorName : string; 
}

interface IChapter {
  _id: string;
  title: string;
  description: string;
  duration: number;
  videos: IVideo[];
  courseId: string | Course;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const ChapterPage = () => {
  const router = useRouter(); 
  const params = useParams();
  const courseId = params.courseId as string; 
  const chapterId = params.chapterId as string; 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chapter, setChapter] = useState<IChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [educatorName, setEducatorName] = useState("");
  const [students, setStudents] = useState(0);
  const [ isOwner , setIsOwner] = useState(false)
  const [ averageRating , setAverageRating ] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {showNotification} = useNotification(); 

  const fetchChapter = useCallback(async () => {
    try {
      const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}`); 
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapter');
      }

      const data = await response.json(); 
      if(!data.courseAccess){
        router.back()
      }
      setEducatorName(data.msg.courseId.educatorName);
      setStudents(data.msg.courseId.totalEnrollment);
      setChapter(data.msg);

      setIsOwner(data.courseModify)
    } catch (error) {
       router.back()
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [chapterId, courseId, router]);

  
  useEffect(() => {
    fetchChapter(); 
  }, [fetchChapter]);


  const handleDelete = async () => {
    console.log("toogle delete"); 
    setDropdownOpen(false);
    const result = await chapterActions.delete(
      courseId , [chapterId]
    );
    
    if (result.success) {
      showNotification('Course deleted successfully!' , "success");
      router.push(`/course/${courseId}/chapters`)
    } else {
      showNotification('Error: ' + result.msg , "error");
    }
  }

  const fetchReview = useCallback(async () => {
  try {
    const response = await fetch(`/api/user/review//${courseId}/averagerating`)

    if (!response.ok) {
      console.log('Failed to submit rating');
    }

    const data = await response.json(); 
    console.log(data)
    setAverageRating(data.averageRating || 0);
  } catch{
    console.log("Error in fetching the error")
  } 
  }, [courseId])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  const handleEditClick = () => {
    setDropdownOpen(false);
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-700 text-lg">Chapter not found</p>
          </div>
        </div>
      </div>
    );
  }
  
  const video = chapter.videos[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
      {/* Cherry blossom decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-4 h-4 bg-pink-300 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-3 h-3 bg-rose-400 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-pink-400 rounded-full opacity-70"></div>
        <div className="absolute top-1/2 right-10 w-3 h-3 bg-rose-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-4 h-4 bg-pink-200 rounded-full opacity-60"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with chapter title and options */}
        <div className="flex justify-between items-start mb-8  mt-10">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200/50 flex-1 mr-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
              {chapter.title}
            </h1>
            <p className="text-gray-700 leading-relaxed">
              {chapter.description.substring(0, 150)}...
            </p>
          </div>
          
          {isOwner && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-3 hover:bg-pink-100/70 text-pink-700 rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm border border-pink-200 rounded-xl shadow-lg z-50">
                  <div className="py-2">
                    <Link 
                      href={`/educator/${courseId}/editchapter/${chapterId}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-pink-700 hover:bg-pink-50 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4 text-pink-600" />
                      Edit chapter
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete chapter
                    </button>
                  </div>
                </div>
              )}
              
              {dropdownOpen && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-200/50">
              <div className="bg-black rounded-xl overflow-hidden shadow-inner">
                {video && (
                  <div className="w-full aspect-video flex items-center justify-center">
                    <video 
                      src={video.videoUrl} 
                      controls 
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200/50">
              <CourseDescription
                title={chapter.title}
                instructor={educatorName}
                description={chapter.description}
                rating={averageRating}
                students={students}
                duration={`${chapter.duration} hours`}
                level="Intermediate"
              />
            </div>

            {/* Reviews Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200/50">
              <ReviewsSection />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat Box */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-200/50">
              <ChatBox />
            </div>
            
            {/* More Videos */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-200/50">
              <MoreVideos/>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-pink-200">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Delete chapter</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Are you sure you want to delete this chapter? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ChapterPage;