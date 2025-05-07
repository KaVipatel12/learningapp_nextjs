"use client";
import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiTrash2, FiVideo, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useRouter, useParams } from 'next/navigation';
import { useNotification } from '@/components/NotificationContext';

// Constants
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Type definitions
interface VideoInput {
  title: string;
  duration: number;
  file: File | null;
  error?: string;
}

interface ChapterInput {
  title: string;
  description: string;
  videos: VideoInput[];
}

export default function AddChaptersPage() {
  const {showNotification} = useNotification()
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [chapters, setChapters] = useState<ChapterInput[]>([
    { title: "", description: "", videos: [{ title: "", duration: 0, file: null }] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Initialize refs structure
  useEffect(() => {
    fileInputRefs.current = chapters.map(chapter => 
      chapter.videos.map(() => null)
    );
  }, [chapters]);

  // Validate file size
  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`File size must be less than ${MAX_FILE_SIZE_MB}MB`, "error");
      return false;
    }
    return true;
  };

  // Add new chapter
  const addChapter = () => {
    setChapters(prev => [
      ...prev,
      { title: "", description: "", videos: [{ title: "", duration: 0, file: null }] }
    ]);
  };

  // Add video to chapter
  const addVideo = (chapterIndex: number) => {
    setChapters(prev => {
      const updated = [...prev];
      updated[chapterIndex].videos.push({ title: "", duration: 0, file: null });
      return updated;
    });
  };

  // Handle chapter field changes
  const handleChapterChange = (
    chapterIndex: number,
    field: keyof Omit<ChapterInput, 'videos'>,
    value: string
  ) => {
    setChapters(prev => {
      const updated = [...prev];
      updated[chapterIndex][field] = value;
      return updated;
    });
  };
  
  // Update the handleVideoChange function with proper typing
  const handleVideoChange = (
    chapterIndex: number,
    videoIndex: number,
    field: keyof VideoInput,
    value: string | number | File | null
  ) => {
    setChapters(prev => {
      const updated = [...prev];
      const video = updated[chapterIndex].videos[videoIndex];
      
      // Handle title updates
      if (field === 'title' && typeof value === 'string') {
        video.title = value;
      } 
      // Handle duration updates
      else if (field === 'duration' && typeof value === 'number') {
        video.duration = value;
      }
      // Handle file updates with proper type checking
      else if (field === 'file') {
        // Case 1: Null value (clearing the file)
        if (value === null) {
          video.file = null;
          video.error = undefined;
        }
        // Case 2: File object (new file selected)
        else if (value instanceof File) {
          if (!validateFile(value)) {
            // Clear the file input if validation fails
            if (fileInputRefs.current[chapterIndex]?.[videoIndex]) {
              fileInputRefs.current[chapterIndex][videoIndex]!.value = '';
            }
            return prev; // Don't update state if validation fails
          }
          video.file = value;
          video.error = undefined;
        }
      }
      
      return updated;
    });
  };

  // Remove video
  const removeVideo = (chapterIndex: number, videoIndex: number) => {
    setChapters(prev => {
      const updated = [...prev];
      updated[chapterIndex].videos.splice(videoIndex, 1);
      return updated;
    });
  };

  // Remove chapter
  const removeChapter = (chapterIndex: number) => {
    if (chapters.length > 1) {
      setChapters(prev => {
        const updated = [...prev];
        updated.splice(chapterIndex, 1);
        return updated;
      });
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all videos before submission
    let hasErrors = false;
    const validatedChapters = chapters.map(chapter => {
      return {
        ...chapter,
        videos: chapter.videos.map(video => {
          if (video.file && video.file.size > MAX_FILE_SIZE_BYTES) {
            hasErrors = true;
            return { ...video, error: `File must be under ${MAX_FILE_SIZE_MB}MB` };
          }
          return video;
        })
      };
    });

    if (hasErrors) {
      setChapters(validatedChapters);
     showNotification(`Please fix validation errors before submitting`, "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('chapters', JSON.stringify(chapters.map(chapter => ({
        title: chapter.title,
        description: chapter.description,
        videos: chapter.videos.map(video => ({
          title: video.title,
          duration: video.duration
        }))
      }))));

      // Append video files
      chapters.forEach((chapter, chapterIndex) => {
        chapter.videos.forEach((video, videoIndex) => {
          if (video.file) {
            formData.append(`chapter-${chapterIndex}-video-${videoIndex}`, video.file);
          }
        });
      });

      const response = await fetch(`/api/educator/addchapter/${courseId}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json()
      if (!response.ok) {
       return showNotification(data.msg, "error");
      }

      showNotification('Chapters added successfully!', "success");
      router.push(`/educator/courses/${courseId}`);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Something went wrong', "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Chapters to Course</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Chapter {chapterIndex + 1}</h3>
              {chapters.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChapter(chapterIndex)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label="Remove chapter"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title*</label>
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => handleChapterChange(chapterIndex, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Introduction to Course"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  value={chapter.description}
                  onChange={(e) => handleChapterChange(chapterIndex, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  placeholder="What will students learn in this chapter?"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-700">Videos</h4>
                  <button
                    type="button"
                    onClick={() => addVideo(chapterIndex)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FiPlus className="mr-1" /> Add Video
                  </button>
                </div>

                {chapter.videos.map((video, videoIndex) => (
                  <div key={videoIndex} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Video {videoIndex + 1}</h5>
                      {chapter.videos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVideo(chapterIndex, videoIndex)}
                          className="text-red-500 hover:text-red-700 p-1"
                          aria-label="Remove video"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Title*</label>
                        <input
                          type="text"
                          value={video.title}
                          onChange={(e) => handleVideoChange(chapterIndex, videoIndex, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                          placeholder="Lesson 1: Basics"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)*</label>
                        <input
                          type="number"
                          value={video.duration}
                          onChange={(e) => handleVideoChange(chapterIndex, videoIndex, 'duration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {videoIndex === 0 ? 'Video File*' : 'Video File'}
                        </label>
                        <div className="flex items-center">
                          <label className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200">
                            <FiVideo className="mr-2 text-gray-600" />
                            <span className="text-sm truncate max-w-xs">
                              {video.file ? video.file.name : 'Choose video file'}
                            </span>
                            <input
                              type="file"
                              ref={el => {
                                if (!fileInputRefs.current[chapterIndex]) {
                                  fileInputRefs.current[chapterIndex] = [];
                                }
                                fileInputRefs.current[chapterIndex][videoIndex] = el;
                              }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleVideoChange(chapterIndex, videoIndex, 'file', e.target.files[0]);
                                }
                              }}
                              className="hidden"
                              accept="video/mp4,video/x-m4v,video/*"
                              required={videoIndex === 0 && !video.file}
                            />
                          </label>
                          {video.file && (
                            <button
                              type="button"
                              onClick={() => {
                                handleVideoChange(chapterIndex, videoIndex, 'file', null);
                                if (fileInputRefs.current[chapterIndex]?.[videoIndex]) {
                                  fileInputRefs.current[chapterIndex][videoIndex]!.value = '';
                                }
                              }}
                              className="ml-2 text-red-500 hover:text-red-700 p-1"
                              aria-label="Remove video file"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: MP4, MOV, AVI. Max size: {MAX_FILE_SIZE_MB}MB.
                        </p>
                        {video.error && (
                          <p className="text-xs text-red-500 mt-1 flex items-center">
                            <FiAlertCircle className="mr-1" /> {video.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={addChapter}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
          >
            <FiPlus className="mr-2" /> Add Chapter
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <FiSave className="mr-2" />
            {isSubmitting ? 'Saving...' : 'Save All Chapters'}
          </button>
        </div>
      </form>
    </div>
  );
}