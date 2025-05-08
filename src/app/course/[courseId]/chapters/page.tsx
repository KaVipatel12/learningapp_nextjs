"use client"

import { Lock, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationContext";
import { PageLoading } from "@/components/PageLoading";
import { useUser } from "@/context/userContext"; 
import { useEducator } from "@/context/educatorContext"; 

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
        return showNotification("There is some error in fetching", "error");
      }
      const data = await response.json(); 
      setChapters(data.msg);
    } catch {
      showNotification("Failed to load chapters. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  }, [courseId, showNotification]);
  
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  useEffect(() => {
    if (user && user.purchaseCourse) {
      const purchased = user.purchaseCourse.some(course => course.courseId?.toString() === courseId);
      setIsCoursePurchased(purchased);
    }
    
    if (educator && educator.courses) {
      const owned = educator?.courses?.some(id => id?.toString() === courseId);
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
    // try {
    //   const response = await fetch(`/api/course/${courseId}/chapters`, {
    //     method: 'DELETE',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ chapterIds: selectedChapters }),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to delete chapters');
    //   }

    //   showNotification("Chapters deleted successfully", "success");
    //   setSelectedChapters([]);
    //   setIsSelectMode(false);
    //   fetchChapters(); // Refresh the list
    // } catch (error) {
    //   showNotification(error.message, "error");
    // }

    showNotification("Deleting chapters", "success")
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
    
    router.push(`/chapters/${chapter._id}`);
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
        <h1 className="text-3xl font-bold text-gray-800">Course Chapters</h1>
        {isOwner && (
          <div className="flex gap-2">
            {isSelectMode ? (
              <>
                <button 
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  <Trash2 size={16} />
                  Delete ({selectedChapters.length})
                </button>
                <button 
                  onClick={() => {
                    setSelectedChapters([]);
                    setIsSelectMode(false);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSelectMode(true)}
                className="px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
              >
                Select Chapters
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid gap-6">
        {chapters.map((chapter) => {
          const totalDuration = chapter.videos.reduce((total, video) => total + video.duration, 0);
          const isSelected = selectedChapters.includes(chapter._id);
          
          return (
            <div
              key={chapter._id}
              onClick={() => handleChapterClick(chapter)}
              className={`p-5 rounded-xl border transition-all relative ${
                isSelectMode && isSelected
                  ? "border-purple-500 bg-purple-50"
                  : (isOwner || isCoursePurchased)
                    ? "border-purple-200 bg-white hover:shadow-md hover:border-purple-300 cursor-pointer"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
            >
              {isSelectMode && (
                <div className={`absolute -left-2 -top-2 w-5 h-5 rounded-full border-2 ${
                  isSelected ? "bg-purple-500 border-purple-500" : "bg-white border-gray-300"
                }`}></div>
              )}
              
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    {(!isOwner && !isCoursePurchased) && <Lock className="w-5 h-5 text-red-500" />}
                    {chapter.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{chapter.description}</p>
                </div>
                <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full" style={{ minWidth: "65px" }}>
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