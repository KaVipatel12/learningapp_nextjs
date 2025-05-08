"use client"

import { useState } from 'react';
import { Star, User } from 'lucide-react';

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

const ReviewsSection = ({ reviews }: { reviews: Review[] }) => {
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });

  const handleSubmitReview = () => {
    if (newReview.rating > 0 && newReview.comment.trim()) {
      // In a real app, you would submit to an API here
      console.log("Submitting review:", newReview);
      setNewReview({ rating: 0, comment: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6">Student Reviews</h2>
      
      {/* Add Review */}
      <div className="mb-8">
        <h3 className="font-medium mb-3">Leave a Review</h3>
        <div className="flex items-center mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setNewReview({...newReview, rating: star})}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={newReview.comment}
          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          placeholder="Share your thoughts about this course..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSubmitReview}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Submit Review
        </button>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gray-100 rounded-full p-2">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{review.user}</p>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500 ml-auto">{review.date}</span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;