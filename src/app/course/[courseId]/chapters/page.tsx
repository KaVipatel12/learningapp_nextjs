"use client"

import { Lock, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationContext";
import { PageLoading } from "@/components/PageLoading";
import { useUser } from "@/context/userContext"; 
import { chapterActions } from "@/utils/ChapterFunctionality";

interface IVideo {
  title: string;
  videoUrl: string;
  duration: number;
}

interface IChapter {
  _id: string;
  title: string;
  description: string;
  videos: IVideo[];
  isLocked: boolean;
}

const ChaptersPage = () => {
  const router = useRouter();
  const params = useParams();  
  const { showNotification } = useNotification();
  const courseId = params.courseId as string;
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const { user } = useUser(); 
  const [isOwner, setIsOwner] = useState(false); 
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const fetchChapters = useCallback(async () => {
    try {                
      const response = await fetch(`/api/course/${courseId}/chapters`); 
      if(!response.ok) {
        return alert("There is some error in fetching");
      }
      const data = await response.json(); 
      setChapters(data.msg);
    } catch {
      alert("Failed to load chapters. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);
  
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  useEffect(() => {
    setIsCoursePurchased(false);
    setIsOwner(false);

    if (user && user.purchaseCourse && Array.isArray(user.purchaseCourse)) {
      const purchased = user.purchaseCourse.some((purchase) => {
        if (!purchase || !purchase.courseId) return false;
        
        let purchaseCourseId;
        if (typeof purchase.courseId === "object") {
          purchaseCourseId = purchase.courseId._id;
        } else {
          purchaseCourseId = purchase.courseId;
        }
        
        return purchaseCourseId && purchaseCourseId.toString() === courseId;
      });
      setIsCoursePurchased(purchased);
    }

    if (user && user.courses && Array.isArray(user.courses)) {
      const owned = user.courses.some(
        (course) => {
          if (!course._id) return false;
          const courseIdStr = typeof course._id === 'object' 
            ? course._id 
            : String(course._id);
          return courseIdStr === courseId;
        }
      );
      setIsOwner(owned);
    }
  }, [user, courseId]);

  const toggleChapterSelection = (chapterId: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleDeleteSelected = async () => {
    const result = await chapterActions.delete(
      courseId , selectedChapters
    );
    
    if (result.success) {
      showNotification('Chapters deleted successfully!', "success");
      setSelectedChapters([]); 
      setIsSelectMode(false);
      fetchChapters();
    } else {
      showNotification('Error deleting chapters', "error");
    }
  };

  const handleChapterClick = (chapter: IChapter) => {
    if (isSelectMode) {
      toggleChapterSelection(chapter._id);
      return;
    }

    if (!isOwner && !isCoursePurchased) {
      showNotification("This chapter is locked. Please purchase the course to access.", "error");
      return;
    }

    router.push(`/course/${courseId}/chapters/${chapter._id}`);
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-pink-800">Course Chapters</h1>
          <div className="p-4 bg-pink-100 border border-pink-300 text-pink-800 rounded-xl shadow-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header section with responsive layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 mt-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-800 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text">
            Course Chapters
          </h1>
          
          {isOwner && (
           <div className="flex flex-row items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2">
            <button 
              onClick={() => router.push(`/educator/${courseId}/addchapter`)}
              className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all flex items-center gap-2 shadow-pink hover:shadow-pink-md text-sm sm:text-base"
            >
              <Plus size={16} />
              <span>Add Chapter</span>
            </button>
            
            {isSelectMode ? (
              <>
                <button 
                  onClick={handleDeleteSelected}
                  disabled={selectedChapters.length === 0}
                  className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all flex items-center gap-2 text-sm sm:text-base ${
                    selectedChapters.length > 0 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-pink hover:shadow-pink-md hover:from-rose-600 hover:to-pink-700' 
                      : 'bg-pink-100 text-pink-400 cursor-not-allowed'
                  }`}
                >
                  <Trash2 size={16} />
                  <span>Delete {selectedChapters.length > 0 ? `(${selectedChapters.length})` : ''}</span>
                </button>
                <button 
                  onClick={() => {
                    setSelectedChapters([]);
                    setIsSelectMode(false);
                  }}
                  className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-pink-700 rounded-xl hover:bg-pink-50 transition-all border border-pink-200 shadow-sm hover:shadow-pink-sm text-sm sm:text-base"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSelectMode(true)}
                className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-pink-700 rounded-xl hover:bg-pink-50 transition-all border border-pink-200 shadow-sm hover:shadow-pink-sm text-sm sm:text-base"
              >
                Select Chapters
              </button>
            )}
          </div>
          )}
        </div>

        {/* Chapters list */}
        <div className="grid gap-3 sm:gap-4">
          {chapters.map((chapter) => {
            const totalDuration = chapter.videos.reduce((total, video) => total + video.duration, 0);
            const isSelected = selectedChapters.includes(chapter._id);
            
            return (
              <div
                key={chapter._id}
                onClick={() => handleChapterClick(chapter)}
                className={`p-4 sm:p-6 rounded-xl border transition-all relative ${
                  isSelectMode && isSelected
                    ? "border-pink-500 bg-gradient-to-r from-pink-100 to-rose-100 shadow-pink-md"
                    : (isOwner || isCoursePurchased)
                      ? "border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 hover:shadow-pink-lg hover:border-pink-300 cursor-pointer hover:-translate-y-0.5"
                      : "border-pink-100 bg-gradient-to-r from-pink-50 to-pink-100 cursor-not-allowed"
                }`}
              >
                {isSelectMode && (
                  <div className={`absolute -left-2 -top-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${
                    isSelected ? "bg-pink-500 border-pink-500 shadow-pink-sm" : "bg-white border-pink-300"
                  }`}></div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-pink-900 flex items-center gap-2">
                      {(!isOwner && !isCoursePurchased) && <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />}
                      {chapter.title}
                    </h2>
                    <p className="text-pink-800 mt-1 sm:mt-2 text-sm sm:text-base">
                      {chapter.description.substring(0, 120)}...
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm bg-gradient-to-r from-pink-200 to-rose-200 text-pink-800 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-pink-inner">
                    {totalDuration}min
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .shadow-pink {
          box-shadow: 0 4px 14px -2px rgba(236, 72, 153, 0.25);
        }
        .shadow-pink-sm {
          box-shadow: 0 2px 8px -1px rgba(236, 72, 153, 0.2);
        }
        .shadow-pink-md {
          box-shadow: 0 6px 18px -3px rgba(236, 72, 153, 0.3);
        }
        .shadow-pink-lg {
          box-shadow: 0 8px 24px -4px rgba(236, 72, 153, 0.35);
        }
        .shadow-pink-inner {
          box-shadow: inset 2px 2px 4px rgba(244, 114, 182, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ChaptersPage;