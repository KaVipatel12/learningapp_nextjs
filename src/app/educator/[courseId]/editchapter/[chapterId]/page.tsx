"use client";
import { useState, useRef, useEffect } from 'react';
import { FiTrash2, FiVideo, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useRouter, useParams } from 'next/navigation';
import { useNotification } from '@/components/NotificationContext';
import { PageLoading } from '@/components/PageLoading';

// Constants
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Type definitions
interface VideoInput {
  id?: string;
  _id?: string;
  title: string;
  duration: number;
  file: File | null;
  videoUrl?: string;
  videoPublicId?: string;
  error?: string;
}

interface ChapterInput {
  id?: string;
  title: string;
  description: string;
  videos: VideoInput[];
}

export default function EditChapterPage() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;
  
  const [chapter, setChapter] = useState<ChapterInput>({
    title: "",
    description: "",
    videos: [{ title: "", duration: 0, file: null }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch chapter data on mount
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}`);
        const data = await response.json();
        console.log(data.msg)
        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch chapter');
        }

        setChapter({
          id: data.msg._id,
          title: data.msg.title,
          description: data.msg.description,
          videos: data.msg.videos?.map((video: VideoInput) => ({
            id: video._id,
            title: video.title,
            duration: video.duration,
            videoUrl: video.videoUrl,
            videoPublicId: video.videoPublicId,
            file: null // No file initially since we're using existing video
          })) || []
        });
      } catch{
        alert("There is some error in server")
        // router.push(`/educator/courses/${courseId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [courseId, chapterId, router]);

  // Initialize refs structure
  useEffect(() => {
    fileInputRefs.current = chapter.videos.map(() => null);
  }, [chapter.videos]);

  // Validate file size
  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`File size must be less than ${MAX_FILE_SIZE_MB}MB`, "error");
      return false;
    }
    return true;
  };

  // Add video to chapter
  const addVideo = () => {
    setChapter(prev => ({
      ...prev,
      videos: [...prev.videos, { title: "", duration: 0, file: null }]
    }));
  };

  // Handle chapter field changes
  const handleChapterChange = (
    field: keyof Omit<ChapterInput, 'videos'>,
    value: string
  ) => {
    setChapter(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle video changes
  const handleVideoChange = (
    videoIndex: number,
    field: keyof VideoInput,
    value: string | number | File | null
  ) => {
    setChapter(prev => {
      const updatedVideos = [...prev.videos];
      const video = updatedVideos[videoIndex];
      
      if (field === 'title' && typeof value === 'string') {
        video.title = value;
      } 
      else if (field === 'duration' && typeof value === 'number') {
        video.duration = value;
      }
      else if (field === 'file') {
        if (value === null) {
          video.file = null;
          video.error = undefined;
        }
        else if (value instanceof File) {
          if (!validateFile(value)) {
            if (fileInputRefs.current[videoIndex]) {
              fileInputRefs.current[videoIndex]!.value = '';
            }
            return prev;
          }
          video.file = value;
          video.error = undefined;
        }
      }
      
      return { ...prev, videos: updatedVideos };
    });
  };

  // Remove video
  const removeVideo = async (videoIndex: number) => {
    const videoToRemove = chapter.videos[videoIndex];
    
    // If it's an existing video with publicId, confirm deletion
    if (videoToRemove.videoPublicId) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      );
      if (!confirmDelete) return;
    }

    setChapter(prev => {
      const updatedVideos = [...prev.videos];
      updatedVideos.splice(videoIndex, 1);
      return { ...prev, videos: updatedVideos };
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all videos before submission
    let hasErrors = false;
    const validatedVideos = chapter.videos.map(video => {
      if (!video.videoUrl && !video.file) {
        hasErrors = true;
        return { ...video, error: "Video file is required" };
      }
      if (video.file && video.file.size > MAX_FILE_SIZE_BYTES) {
        hasErrors = true;
        return { ...video, error: `File must be under ${MAX_FILE_SIZE_MB}MB` };
      }
      return video;
    });

    if (hasErrors) {
      setChapter(prev => ({ ...prev, videos: validatedVideos }));
      showNotification(`Please fix validation errors before submitting`, "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('chapterId', chapterId);
      formData.append('chapter', JSON.stringify({
        title: chapter.title,
        description: chapter.description,
        videos: chapter.videos.map(video => ({
          id: video.id, // Include video ID for existing videos
          title: video.title,
          duration: video.duration,
          videoUrl: video.videoUrl,
          videoPublicId: video.videoPublicId
        }))
      }));

      // Append only new video files
      chapter.videos.forEach((video, videoIndex) => {
        if (video.file) {
          formData.append(`video-${videoIndex}`, video.file);
        }
      });

      const response = await fetch(`/api/educator/editchapter/${courseId}/${chapterId}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        return showNotification(data.msg || "Failed to update chapter", "error");
      }

      showNotification('Chapter updated successfully!', "success");
      router.push(`/course/${courseId}/chapters/${chapterId}`);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Something went wrong', "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Chapter</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title*</label>
            <input
              type="text"
              value={chapter.title}
              onChange={(e) => handleChapterChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Introduction to Course"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
            <textarea
              value={chapter.description}
              onChange={(e) => handleChapterChange('description', e.target.value)}
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
                onClick={addVideo}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Video
              </button>
            </div>

            {chapter.videos.map((video, videoIndex) => (
              <div key={videoIndex} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-sm font-medium text-gray-700">Video {videoIndex + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeVideo(videoIndex)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Remove video"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Title*</label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => handleVideoChange(videoIndex, 'title', e.target.value)}
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
                      onChange={(e) => handleVideoChange(videoIndex, 'duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video File {video.videoUrl ? '(Optional)' : '*'}
                    </label>
                    {video.videoUrl ? (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">Current video:</p>
                        <a 
                          href={video.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {video.title || 'View Video'}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a new file below to replace this video
                        </p>
                      </div>
                    ) : null}
                    
                    <div className="flex items-center">
                      <label className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200">
                        <FiVideo className="mr-2 text-gray-600" />
                        <span className="text-sm truncate max-w-xs">
                          {video.file ? video.file.name : 'Choose video file'}
                        </span>
                        <input
                            type="file"
                            ref={(el: HTMLInputElement | null) => {
                                if (el) {
                                fileInputRefs.current[videoIndex] = el;
                                }
                            }}
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                handleVideoChange(videoIndex, 'file', e.target.files[0]);
                                }
                            }}
                            className="hidden"
                            accept="video/mp4,video/x-m4v,video/*"
                            required={!video.videoUrl && !video.file}
                            />
                      </label>
                      {(video.file || video.videoUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleVideoChange(videoIndex, 'file', null);
                            if (fileInputRefs.current[videoIndex]) {
                              fileInputRefs.current[videoIndex]!.value = '';
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

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => router.push(`/educator/courses/${courseId}`)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <FiSave className="mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}