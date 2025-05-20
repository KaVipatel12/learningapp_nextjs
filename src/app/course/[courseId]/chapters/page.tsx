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
    if (user && user.purchaseCourse) {
      const purchased = user.purchaseCourse.some(purchase => {
        const purchaseCourseId = typeof purchase.courseId === 'object' 
          ? purchase.courseId._id 
          : purchase.courseId;
        return purchaseCourseId === courseId;
      });
      setIsCoursePurchased(purchased);
    }
      
    if (educator && educator.courses) {
      const owned = educator?.courses?.some(id => id?._id.toString() === courseId);
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
      showNotification('Course deleted successfully!', "success");
      setSelectedChapters([]); 
      setIsSelectMode(false)
    } else {
      showNotification('Error' , "error");
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
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Course Chapters</h1>
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-900">Course Chapters</h1>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/educator/${courseId}/addchapter`)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all flex items-center gap-1 shadow-md"
          >
            <Plus size={16} />
            Add Chapter
          </button>
          
          {isOwner && (
            <>
              {isSelectMode ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={selectedChapters.length === 0}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1 shadow-md ${
                      selectedChapters.length > 0 
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all border border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsSelectMode(true)}
                  className="px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-all border border-purple-300 shadow-sm"
                >
                  Select Chapters
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {chapters.map((chapter) => {
          const totalDuration = chapter.videos.reduce((total, video) => total + video.duration, 0);
          const isSelected = selectedChapters.includes(chapter._id);
          
          return (
            <div
              key={chapter._id}
              onClick={() => handleChapterClick(chapter)}
              className={`p-5 rounded-xl border transition-all relative ${
                isSelectMode && isSelected
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : (isOwner || isCoursePurchased)
                    ? "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg hover:border-purple-300 cursor-pointer"
                    : "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed"
              }`}
            >
              {isSelectMode && (
                <div className={`absolute -left-2 -top-2 w-5 h-5 rounded-full border-2 ${
                  isSelected ? "bg-purple-500 border-purple-500" : "bg-white border-purple-300"
                }`}></div>
              )}
              
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                    {(!isOwner && !isCoursePurchased) && <Lock className="w-5 h-5 text-pink-600" />}
                    {chapter.title}
                  </h2>
                  <p className="text-purple-800 mt-1">{chapter.description}</p>
                </div>
                <span className="text-sm bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 px-3 py-1 rounded-full shadow-inner" style={{ minWidth: "65px" }}>
                  {totalDuration} min
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChaptersPage;