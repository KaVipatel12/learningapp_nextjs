"use client"

import { Lock, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationContext";
import { PageLoading } from "@/components/PageLoading";
import { useUser } from "@/context/userContext"; 
import { useEducator } from "@/context/educatorContext"; 
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
  const { educator } = useEducator(); 
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
  // Reset states first
  setIsCoursePurchased(false);
  setIsOwner(false);

  if (user && user.purchaseCourse && Array.isArray(user.purchaseCourse)) {
    const purchased = user.purchaseCourse.some((purchase) => {
      // Check if purchase object exists and has courseId
      if (!purchase || !purchase.courseId) return false;
      
      let purchaseCourseId;
      if (typeof purchase.courseId === "object") {
        // courseId is populated (Course object), get its _id
        purchaseCourseId = purchase.courseId._id;
      } else {
        // courseId is just the ObjectId string
        purchaseCourseId = purchase.courseId;
      }
      
      return purchaseCourseId && purchaseCourseId.toString() === courseId;
    });
    setIsCoursePurchased(purchased);
  }

  // Only check for ownership if user is actually an educator
  if (educator && educator.courses && Array.isArray(educator.courses)) {
    const owned = educator.courses.some(
      (course) => {
        // More robust null checking
        if (!course || !course._id) return false;
        
        const courseIdStr = typeof course._id === 'object' 
          ? course._id.toString() 
          : String(course._id);
        
        return courseIdStr === courseId;
      }
    );
    setIsOwner(owned);
  }

}, [user, educator, courseId]);

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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8 my-9">
          <h1 className="text-3xl font-bold text-pink-800 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text">
            Course Chapters
          </h1>
          
          {isOwner && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push(`/educator/${courseId}/addchapter`)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all flex items-center gap-2 shadow-pink hover:shadow-pink-md"
              >
                <Plus size={16} />
                Add Chapter
              </button>
              
              {isSelectMode ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={selectedChapters.length === 0}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                      selectedChapters.length > 0 
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-pink hover:shadow-pink-md hover:from-rose-600 hover:to-pink-700' 
                        : 'bg-pink-100 text-pink-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 size={16} />
                    Delete {selectedChapters.length > 0 ? `(${selectedChapters.length})` : ''}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSelectedChapters([]);
                      setIsSelectMode(false);
                    }}
                    className="px-4 py-2 bg-white text-pink-700 rounded-xl hover:bg-pink-50 transition-all border border-pink-200 shadow-sm hover:shadow-pink-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsSelectMode(true)}
                  className="px-4 py-2 bg-white text-pink-700 rounded-xl hover:bg-pink-50 transition-all border border-pink-200 shadow-sm hover:shadow-pink-sm"
                >
                  Select Chapters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {chapters.map((chapter) => {
            const totalDuration = chapter.videos.reduce((total, video) => total + video.duration, 0);
            const isSelected = selectedChapters.includes(chapter._id);
            
            return (
              <div
                key={chapter._id}
                onClick={() => handleChapterClick(chapter)}
                className={`p-6 rounded-xl border transition-all relative ${
                  isSelectMode && isSelected
                    ? "border-pink-500 bg-gradient-to-r from-pink-100 to-rose-100 shadow-pink-md"
                    : (isOwner || isCoursePurchased)
                      ? "border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 hover:shadow-pink-lg hover:border-pink-300 cursor-pointer hover:-translate-y-0.5"
                      : "border-pink-100 bg-gradient-to-r from-pink-50 to-pink-100 cursor-not-allowed"
                }`}
              >
                {isSelectMode && (
                  <div className={`absolute -left-2 -top-2 w-5 h-5 rounded-full border-2 ${
                    isSelected ? "bg-pink-500 border-pink-500 shadow-pink-sm" : "bg-white border-pink-300"
                  }`}></div>
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-pink-900 flex items-center gap-2">
                      {(!isOwner && !isCoursePurchased) && <Lock className="w-5 h-5 text-pink-600" />}
                      {chapter.title}
                    </h2>
                    <p className="text-pink-800 mt-2">{chapter.description.substring(0, 150)}...</p>
                  </div>
                  <span className="text-sm bg-gradient-to-r from-pink-200 to-rose-200 text-pink-800 px-3 py-1 rounded-full shadow-pink-inner">
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