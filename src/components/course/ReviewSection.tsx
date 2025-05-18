"use client"

import { useCallback, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useNotification } from '../NotificationContext';
import { useParams } from 'next/navigation';

interface RatingData {
  courseId: string;
  rating: number;
}

const ReviewsSection = () => {
  const { showNotification } = useNotification();
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {courseId} = useParams(); 

  const handleRatingSubmit = async (rating: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/user/review/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating
        } as RatingData),
      });

      if (!response.ok) {
        showNotification('Failed to submit rating', "error");
      }

      setUserRating(rating);
      showNotification("Your rating has been submitted", "success");
    } catch{
      showNotification(
        "Failed to submit rating",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchReview = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/review/${courseId}`)

      if (!response.ok) {
        console.log('Failed to submit rating');
      }

      const data = await response.json(); 
      setUserRating(data.msg || 0);
    } catch{
      console.log("Error in fetching the error")
    } 
  }, [courseId])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6">Course Rating</h2>
      
      <div className="mb-8">
        <h3 className="font-medium mb-3">Rate this course</h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingSubmit(star)}
              disabled={isSubmitting}
              className="focus:outline-none disabled:opacity-50"
              aria-label={`Rate ${star} star`}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {userRating ? `You rated this ${userRating} star${userRating > 1 ? 's' : ''}` : "Select a rating"}
        </p>
      </div>
    </div>
  );
};

export default ReviewsSection;