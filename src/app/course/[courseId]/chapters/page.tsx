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

interface IQuiz {
  _id: string;
  title: string;
  description: string;
  questions: [];
  isLocked: boolean;
}

const CourseContentPage = () => {
  const router = useRouter();
  const params = useParams();  
  const { showNotification } = useNotification();
  const courseId = params.courseId as string;
  const [activeTab, setActiveTab] = useState<'chapters' | 'quizzes'>('chapters');
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser(); 
  const [isOwner, setIsOwner] = useState(false); 
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch chapters
      const chaptersResponse = await fetch(`/api/course/${courseId}/chapters`);
      if (!chaptersResponse.ok) {
        throw new Error("Failed to fetch chapters");
      }
      const chaptersData = await chaptersResponse.json();
      setChapters(chaptersData.msg);

      // Fetch quizzes
      const quizzesResponse = await fetch(`/api/quiz/${courseId}/fetchquizes`);
      if (!quizzesResponse.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      const quizzesData = await quizzesResponse.json();
      setQuizzes(quizzesData.quiz);

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  }, [courseId]);
  
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

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

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      let result;
      
      if (activeTab === 'chapters') {
        result = await chapterActions.delete(courseId, selectedItems);
      } else {
        // Call quiz delete API
        const response = await fetch(`/api/quiz/${courseId}/deletequiz`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quizIds: selectedItems , courseId}),
        });
        
        if (!response.ok) {
          showNotification('Failed to delete quizzes', "error");
        }
        showNotification('Failed to delete quizzes', "error");
        
        result = { success: true };
      }
      
      if (result.success) {
        showNotification(`${activeTab === 'chapters' ? 'Chapters' : 'Quizzes'} deleted successfully!`, "success");
        setSelectedItems([]); 
        setIsSelectMode(false);
        fetchContent();
      } else {
        throw new Error('Deletion failed');
      }
    } catch {
      showNotification(`Error deleting ${activeTab === 'chapters' ? 'chapters' : 'quizzes'}`, "error");
    }
  };

  const handleItemClick = (item: IChapter | IQuiz) => {
    if (isSelectMode) {
      toggleItemSelection(item._id);
      return;
    }

    if (!isOwner && !isCoursePurchased) {
      showNotification("This content is locked. Please purchase the course to access.", "error");
      return;
    }

    if (activeTab === 'chapters') {
      router.push(`/course/${courseId}/chapters/${item._id}`);
    } else {
      router.push(`/course/${courseId}/quiz/${item._id}`);
    }
  };

  if (loading) {
    return <PageLoading />;
  }
  return (
    <div className="min-h-screen">      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header section with responsive layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 mt-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-800 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text">
            Course Content
          </h1>
          
          {isOwner && (
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2">
              <button 
                onClick={() => 
                  router.push(
                    activeTab === 'chapters' 
                      ? `/educator/${courseId}/addchapter` 
                      : `/course/${courseId}/quiz/addquiz`
                  )
                }
                className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all flex items-center gap-2 shadow-pink hover:shadow-pink-md text-sm sm:text-base"
              >
                <Plus size={16} />
                <span>Add {activeTab === 'chapters' ? 'Chapter' : 'Quiz'}</span>
              </button>
              
              {isSelectMode ? (
                <>
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={selectedItems.length === 0}
                    className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all flex items-center gap-2 text-sm sm:text-base ${
                      selectedItems.length > 0 
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-pink hover:shadow-pink-md hover:from-rose-600 hover:to-pink-700' 
                        : 'bg-pink-100 text-pink-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 size={16} />
                    <span>Delete {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedItems([]);
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
                  Select {activeTab === 'chapters' ? 'Chapters' : 'Quizzes'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pink-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm sm:text-base ${activeTab === 'chapters' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-pink-400 hover:text-pink-600'}`}
            onClick={() => setActiveTab('chapters')}
          >
            Chapters
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm sm:text-base ${activeTab === 'quizzes' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-pink-400 hover:text-pink-600'}`}
            onClick={() => setActiveTab('quizzes')}
          >
            Quizzes
          </button>
        </div>

        {/* Content list */}
        <div className="grid gap-3 sm:gap-4">
          {activeTab === 'chapters' ? (
            chapters.map((chapter) => {
              const totalDuration = chapter.videos.reduce((total, video) => total + video.duration, 0);
              const isSelected = selectedItems.includes(chapter._id);
              
              return (
                <div
                  key={chapter._id}
                  onClick={() => handleItemClick(chapter)}
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
            })
          ) : (
            quizzes.map((quiz) => {
              const isSelected = selectedItems.includes(quiz._id);
              
              return (
                <div
                  key={quiz._id}
                  onClick={() => handleItemClick(quiz)}
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
                        {quiz.title}
                      </h2>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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

export default CourseContentPage;