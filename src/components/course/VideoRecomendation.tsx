"use client"

import { Play } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
}

const VideoRecommendations = ({
  videos,
  activeVideo,
  setActiveVideo
}: {
  videos: Video[];
  activeVideo: number;
  setActiveVideo: (index: number) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Course Content</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => setActiveVideo(index)}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              index === activeVideo ? 'bg-purple-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-md p-2 flex-shrink-0">
                <Play className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className={`font-medium ${
                  index === activeVideo ? 'text-purple-600' : 'text-gray-800'
                }`}>
                  {video.title}
                </p>
                <p className="text-sm text-gray-500">{video.duration}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoRecommendations;