"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Video {
  videoUrl: string;
  title: string;
  id?: string;
}

interface VideoPlayerProps {
  video: Video;
  courseId: string;
  chapterId: string;
}

const VideoPlayer = ({ video, courseId, chapterId }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState({
    canPlay: false,
    hasError: false,
    errorMessage: '',
    loadedData: false,
    currentTime: 0,
    duration: 0
  });
  
  // Progress tracking state
  const [lastSaved, setLastSaved] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  // Fetch last watched time from API
  const fetchLastWatched = useCallback(async () => {
    try {
      console.log("📊 Fetching last watched time...");
      const res = await fetch(
        `/api/user/watchhistory/savehistory/${courseId}/${chapterId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await res.json();
      let lastWatchedTime = 0;
      
      if (data.ok) {
        lastWatchedTime = data.msg;
        console.log("⏰ Last watched time:", lastWatchedTime, "seconds");
      }

      // Resume from last watched time
      if (videoRef.current && lastWatchedTime > 5 && !hasResumed) { // Only resume if > 5 seconds
        videoRef.current.currentTime = lastWatchedTime;
        setHasResumed(true);
        console.log("▶️ Resuming from:", lastWatchedTime, "seconds");
      }
    } catch (error) {
      console.error("❌ Failed to fetch watch history:", error);
    }
  }, [courseId, chapterId, hasResumed]);

  // Save progress to backend
  const saveProgressToBackend = useCallback(
    async (seconds: number) => {
      try {
        console.log("💾 Saving progress:", Math.floor(seconds), "seconds");
        await axios.post("/api/user/watchhistory/savehistory", {
          videoId: video.id || chapterId,
          courseId,
          chapterId,
          watchedTime: Math.floor(seconds),
        });
        console.log("✅ Progress saved successfully");
      } catch (error) {
        console.error("❌ Failed to save progress:", error);
      }
    },
    [video.id, courseId, chapterId]
  );

  // Debug: Log all video events
  const handleLoadStart = () => {
    console.log("🔄 Load started");
    setVideoState(prev => ({ ...prev, hasError: false }));
  };

  const handleLoadedMetadata = () => {
    console.log("📊 Metadata loaded", {
      duration: videoRef.current?.duration,
      videoWidth: videoRef.current?.videoWidth,
      videoHeight: videoRef.current?.videoHeight
    });
  };

  const handleLoadedData = () => {
    console.log("✅ Data loaded");
    setVideoState(prev => ({ 
      ...prev, 
      loadedData: true,
      duration: videoRef.current?.duration || 0
    }));
    
    // Fetch last watched time when video data is loaded
    fetchLastWatched();
  };

  const handleCanPlay = () => {
    console.log("▶️ Can play");
    setVideoState(prev => ({ ...prev, canPlay: true }));
  };

  const handleCanPlayThrough = () => {
    console.log("🚀 Can play through");
  };

  const handleError = (e) => {
    console.error("❌ Video Error:", e);
    const error = videoRef.current?.error;
    let errorMsg = "Unknown error";
    
    if (error) {
      switch (error.code) {
        case 1:
          errorMsg = "MEDIA_ERR_ABORTED - The user aborted the video";
          break;
        case 2:
          errorMsg = "MEDIA_ERR_NETWORK - Network error";
          break;
        case 3:
          errorMsg = "MEDIA_ERR_DECODE - Decode error";
          break;
        case 4:
          errorMsg = "MEDIA_ERR_SRC_NOT_SUPPORTED - Source not supported";
          break;
      }
    }
    
    console.error("Error details:", errorMsg);
    setVideoState(prev => ({ 
      ...prev, 
      hasError: true, 
      errorMessage: errorMsg 
    }));
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setVideoState(prev => ({
        ...prev,
        currentTime: currentTime
      }));
      
      // Auto-save progress every 15 seconds
      if (currentTime - lastSaved >= 15) {
        saveProgressToBackend(currentTime);
        setLastSaved(currentTime);
      }
    }
  };

  const handlePlay = () => {
    console.log("▶️ Playing");
  };

  const handlePause = () => {
    console.log("⏸️ Paused");
    // Save progress when user pauses
    if (videoRef.current && videoRef.current.currentTime > 0) {
      saveProgressToBackend(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    console.log("🏁 Video ended");
    // Mark as completed when video ends
    if (videoRef.current) {
      saveProgressToBackend(videoRef.current.duration);
    }
  };

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (videoState.currentTime > 0) {
        console.log("🔄 Component unmounting, saving final progress");
        // Use synchronous request for cleanup
        const finalTime = videoRef.current?.currentTime || videoState.currentTime;
        navigator.sendBeacon(
          "/api/user/watchhistory/savehistory", 
          JSON.stringify({
            videoId: video.id || chapterId,
            courseId,
            chapterId,
            watchedTime: Math.floor(finalTime),
          })
        );
      }
    };
  }, [videoState.currentTime, video.id, courseId, chapterId]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        preload="metadata"
        onLoadStart={handleLoadStart}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onCanPlayThrough={handleCanPlayThrough}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      >
        <source src={video.videoUrl} type="video/mp4" />
        <source src={video.videoUrl} type="video/webm" />
        <source src={video.videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>

      {/* Loading overlay */}
      {!videoState.canPlay && !videoState.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {videoState.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75">
          <div className="text-white text-center p-4">
            <p className="text-xl mb-2">❌ Video Error</p>
            <p className="text-sm">{videoState.errorMessage}</p>
            <p className="text-xs mt-2">Please check your video URL or try refreshing the page.</p>
          </div>
        </div>
      )}

      {/* Video info overlay */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white text-lg font-semibold">{video.title}</p>
            {videoState.duration > 0 && (
              <p className="text-gray-300 text-sm">
                {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
              </p>
            )}
          </div>
          
          {/* Progress indicator */}
          {videoState.duration > 0 && (
            <div className="text-gray-300 text-sm">
              {Math.round((videoState.currentTime / videoState.duration) * 100)}% watched
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;