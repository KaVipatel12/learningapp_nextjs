"use client"

// app/quiz-history/page.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PageLoading } from '@/components/PageLoading';

interface QuizAttempt {
  _id: string;
  quizId: {
    _id: string;
    title: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  score: number;
  total: number;
  submittedAt: string;
}

const QuizHistoryPage = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get('/api/quiz/userhistory');
        setAttempts(response.data.attempts);
      } catch (err) {
        console.error('Error fetching quiz history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoading></PageLoading>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto mt-13">
        <h1 className="text-3xl font-bold text-pink-600 mb-8 text-center">Your Quiz History</h1>
        
        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-pink-700 text-lg">{"You haven't taken any quizzes yet."}</p>
            <button 
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-xl transition duration-200"
              onClick={() => window.location.href = '/courses'}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {attempts.map((attempt) => (
              <div key={attempt._id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-pink-700">{attempt.quizId?.title || "Quiz"}</h2>
                    <p className="text-pink-600">Course: {attempt.courseId.title}</p>
                    <p className="text-gray-500 text-sm">
                      Completed on: {new Date(attempt.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-pink-600">
                        {attempt.score}/{attempt.total}
                      </span>
                      <span className="text-sm text-pink-500">
                        {Math.round((attempt.score / attempt.total) * 100)}%
                      </span>
                    </div>
                    
                    <div className="w-24 h-2 bg-pink-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-600" 
                        style={{ width: `${(attempt.score / attempt.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button 
                    className="text-pink-600 hover:text-pink-800 font-medium flex items-center"
                    onClick={() => router.push(`/course/${attempt.courseId._id}/quiz/${attempt.quizId}`)}
                  >
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistoryPage;