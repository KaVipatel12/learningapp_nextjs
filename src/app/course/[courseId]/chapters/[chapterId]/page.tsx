"use client"

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MoreVertical , Trash2, Edit, Flag } from 'lucide-react';
import ReviewsSection from '@/components/course/ReviewSection';
import ChatBox from '@/components/course/ChatBox';
import CourseDescription from '@/components/course/CourseDescription';
import { PageLoading } from '@/components/PageLoading';
import { chapterActions } from '@/utils/ChapterFunctionality';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationContext';
import MoreVideos from '@/components/course/MoreVideos';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import PleaseWait from '@/components/PleaseWait';
import VideoPlayer from '@/components/course/VideoPlayer';
import ReportToggle from '@/components/course/ReportButton';

// Types
interface IVideo {
  title: string;
  videoUrl: string;
  videoPublicId: string;
  duration: number;
  _id: string;
}

interface ICourse {
  educatorName: string;
  totalEnrollment: number;
}

interface IChapter {
  _id: string;
  title: string;
  description: string;
  duration: number;
  videos: IVideo[];
  courseId: string | ICourse;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface IChapterResponse {
  msg: IChapter;
  courseAccess: boolean;
  courseModify: boolean;
}

interface IRatingResponse {
  averageRating: number;
}

const ChapterPage = () => {
  const router = useRouter();
  const params = useParams();
  const { showNotification } = useNotification();

  // Extract params with proper typing
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;

  // State management
  const [chapter, setChapter] = useState<IChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [educatorName, setEducatorName] = useState("");
  const [students, setStudents] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch chapter data
  const fetchChapter = useCallback(async () => {
    if (!courseId || !chapterId) {
      setError("Invalid course or chapter ID");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chapter: ${response.status}`);
      }

      const data: IChapterResponse = await response.json();
      console.log(data)
      
      if (!data.courseAccess) {
        alert("You don't have access to this course");
        router.back();
        return;
      }

      // Type guard for courseId
      if (typeof data.msg.courseId === 'object') {
        setEducatorName(data.msg.courseId.educator?.educatorName);
        setStudents(data.msg.courseId.totalEnrollment);
      }

      setChapter(data.msg);
      console.log(data.courseModify)
      setIsOwner(data.courseModify);

    } catch (error) {
      console.error("Error fetching chapter:", error);
      setError(error instanceof Error ? error.message : "Failed to load chapter");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [chapterId, courseId, router]);

  // Fetch average rating
  const fetchReview = useCallback(async () => {
    if (!courseId) return;

    try {
      // Fixed the API endpoint (removed double slash)
      const response = await fetch(`/api/user/review/${courseId}/averagerating`);

      if (!response.ok) {
        console.warn('Failed to fetch rating');
        return;
      }

      const data: IRatingResponse = await response.json();
      setAverageRating(data.averageRating || 0);
    } catch (error) {
      console.warn("Error fetching rating:", error);
    }
  }, [courseId]);

  // Handle chapter deletion
  const handleDelete = async () => {
    if (!courseId || !chapterId) return;

    setDeleteLoading(true);
    setDropdownOpen(false);

    try {
      const result = await chapterActions.delete(courseId, [chapterId]);
      
      if (result.success) {
        showNotification('Chapter deleted successfully!', "success");
        router.push(`/course/${courseId}/chapters`);
      } else {
        showNotification('Error: ' + result.msg, "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification('Failed to delete chapter', "error");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  // Loading state
  if (loading) {
    return <PageLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <p className="text-red-600 text-lg font-medium">Error</p>
            <p className="text-gray-700 mt-2">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chapter not found
  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-700 text-lg">Chapter not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const video = chapter.videos?.[0];

  return (
    <div className="min-h-screen">
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
        <div className="flex justify-between items-start mb-8 mt-10">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200/50 flex-1 mr-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
              {chapter.title}
            </h1>
            <p className="text-gray-700 leading-relaxed">
              {chapter.description.length > 150 
                ? `${chapter.description.substring(0, 150)}...`
                : chapter.description
              }
            </p>
          </div>
          
          {isOwner ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50 relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-3 hover:bg-pink-100/70 text-pink-700 rounded-xl transition-colors duration-200 flex items-center justify-center"
                aria-label="Chapter options"
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
                  aria-hidden="true"
                />
              )}
            </div>
          ) : (
            /* Simple report button for regular users */
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200/50">
              <ReportToggle
                type="chapter"
                chapterId={chapterId}
                courseId={courseId}
                userId={chapter.educator?._id}
                buttonProps={{
                  className: "p-3 hover:bg-pink-100/70 text-pink-700 rounded-xl transition-colors duration-200 w-full h-full flex items-center justify-center",
                  type: "text",
                  size: "small"
                }}
              >
                <Flag className="h-5 w-5" />
              </ReportToggle>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-200/50">
              <div className="bg-black rounded-xl overflow-hidden shadow-inner">
                {video ? (
                  <VideoPlayer video={video} chapterId={chapterId} courseId={courseId} ></VideoPlayer>
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center text-white">
                    <p>No video available for this chapter</p>
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
              <MoreVideos />
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal - FIXED POSITIONING */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center mb-4">
                <ExclamationCircleOutlined className="text-red-500 text-xl mr-2" />
                <h2 className="text-lg font-semibold">Confirm Chapter Deletion</h2>
              </div>
              
              <div className="mb-6">
                <p className="mb-2">Are you sure you want to delete this chapter?</p>
                <p className="mb-2">This action will permanently delete:</p>
                <ul className="list-disc ml-5 mb-3">
                  <li>Chapter content and details</li>
                  <li>Associated videos and materials</li>
                </ul>
                <p><strong>This action cannot be undone.</strong></p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteLoading && < PleaseWait message={"Deleting the chapter"} />}
    </div>
  );
};

export default ChapterPage;