'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

interface HistoryItem {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    imageUrl: string;
    instructor: {
      name: string;
    };
  };
  chapterId: string;
  lastWatchedAt: string;
  videos: { duration: number }[];
}

export default function HistorySlider() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/fetchhistory');
      if (res.data?.history) {
        setHistory(res.data.history);
        console.log('Fetched history:', res.data.history);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (history.length <= 0) return null;

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const watchedDate = new Date(dateString);
    const seconds = Math.floor((now.getTime() - watchedDate.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const amount = Math.floor(seconds / value);
      if (amount > 0) {
        return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
        <div className="relative mb-6 sm:mb-8 p-6 sm:p-8 pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Watch History
          </h2>

          <div className="flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-pink-100">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={() =>
                  router.push(`/course/${item.courseId._id}/chapters/${item.chapterId}`)
                }
                className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-pink-100 group min-w-[200px] max-w-[220px] flex-shrink-0"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={item.courseId.imageUrl}
                    alt={item.courseId.title}
                    fill
                    className="object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-pink-900 line-clamp-2 mb-1">
                    {item.courseId.title}
                  </h3>
                  <p className="text-xs text-pink-600">
                    Last watched {getTimeAgo(item.lastWatchedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
