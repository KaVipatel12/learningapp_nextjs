"use client"

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Chapter {
  _id: string;
  title: string;
  duration: number;
  videos: {
    videoUrl: string;
    _id: string;
}[];
}

const MoreVideos = () => {

    const [chapters , setChapters] = useState([])
    const {courseId , chapterId} = useParams(); 
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
    }
  }, [courseId]);
  
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="lg:mt-6">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900">Course Chapters</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-600 hover:text-purple-800"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {/* Chapters List - Always visible on desktop, conditionally on mobile */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 hidden lg:block">
            <h3 className="font-medium text-gray-900">Course Chapters</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {chapters.map((chapter : Chapter) => (
              <div 
                key={chapter._id}
                className={`p-4 ${chapter._id === chapterId ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
              >
                {chapter._id === chapterId ? (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white" fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">{chapter.title}</p>
                      <p className="text-sm text-purple-600">{chapter.duration} min</p>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={`/course/${courseId}/chapters/${chapter._id}`}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                      <Play className="h-5 w-5 text-gray-600" fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 hover:text-purple-700">{chapter.title}</p>
                      <p className="text-sm text-gray-600">{chapter.duration} min</p>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreVideos;