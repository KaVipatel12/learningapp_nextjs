"use client"

import { Play } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
}

const VideoPlayer = ({ video }: { video: Video }) => {
  return (
    <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
      {/* Placeholder for actual video player */}
      <div className="text-center">
        <Play className="h-16 w-16 text-white mx-auto mb-4" />
        <p className="text-white text-lg font-medium">{video.title}</p>
        <p className="text-gray-400">{video.duration}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;