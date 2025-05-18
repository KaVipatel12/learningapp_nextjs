"use client"

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import ReviewsSection from '@/components/course/ReviewSection';
import ChatBox from '@/components/course/ChatBox';
import CourseDescription from '@/components/course/CourseDescription';
import { PageLoading } from '@/components/PageLoading';
import {Dialog , Button , DialogFooter , DialogTitle , DialogHeader , DialogContent, DropdownMenuItem, DropdownMenuContent , DropdownMenuTrigger , DropdownMenu} from "@/components/course/ChapterPageFuncs"
import { useRouter } from 'next/navigation';
import { chapterActions } from '@/utils/ChapterFunctionality';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationContext';

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

  if (loading) {
    return <PageLoading />;
  }

  if (!chapter) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Chapter not found</div>;
  }
  // Get the first (and only) video
  const video = chapter.videos[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with chapter title and options */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{chapter.title}</h1>
          <p className="text-gray-600 mt-2">{chapter.description.substring(0, 100)}...</p>
        </div>
        
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button key='options' variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem key='edit' className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <Link href={`/educator/${courseId}/editchapter/${chapterId}`}> Edit chapter </Link> 
              </DropdownMenuItem>
              <DropdownMenuItem key='delete'
                className="flex items-center gap-2 text-red-600"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete chapter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Player */}
          <div className="bg-black rounded-xl overflow-hidden">
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

          {/* Chapter Description */}
          <CourseDescription
            title={chapter.title}
            instructor= {educatorName} // Hardcoded for now
            description={chapter.description}
            rating={averageRating} // Hardcoded for now
            students={students} // Hardcoded for now
            duration={`${chapter.duration} hours`}
            level="Intermediate" // Hardcoded for now
          />

          {/* Reviews Section */}
          <ReviewsSection />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat Box */}
          <ChatBox />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chapter</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this chapter? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button key='cancel' variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button key='confirm' variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChapterPage;