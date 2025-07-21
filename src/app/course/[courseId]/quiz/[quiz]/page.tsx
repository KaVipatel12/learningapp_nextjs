"use client"

import { useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  questions: Question[];
}

interface QuizAnswer {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

interface QuizAttempt {
  quizId: string;
  courseId: string;
  score: number;
  total: number;
  answers: QuizAnswer[];
}

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingExistingScore, setCheckingExistingScore] = useState(true);

  const { courseId } = useParams();
  const { quiz } = useParams();
  const router = useRouter();
  // Get current question safely
  const currentQuestion = quizData?.questions?.[currentQuestionIndex] || null;
  const totalQuestions = quizData?.questions?.length || 0;

  const handleOptionSelect = (optionIndex: number) => {
    if (!showCorrectAnswer) {
      setSelectedOption(optionIndex);
    }
  };

//   check if the score already exists 

  const fetchExistingScore = useCallback(async () => {
  if (!quizData) return;

  try {
    const res = await fetch(`/api/quiz/${courseId}/fetchquizes/${quiz}/fetchquizscore`);
    
    if (!res.ok) {
      // If no score exists, continue with quiz
      setCheckingExistingScore(false);
      return;
    }
    
    const data = await res.json();
    
    if (data.fetchScore) {
      // If score exists, populate the state with previous attempt data
      setScore(data.fetchScore.score);
      setAnswers(data.fetchScore.total);
      setQuizCompleted(true);
    }
  } catch (err) {
    console.error("Error checking existing score:", err);
    // Continue with quiz if there's an error
  } finally {
    setCheckingExistingScore(false);
  }
}, [courseId, quiz , quizData]);

useEffect(() => {
  if (quizData) {
    fetchExistingScore();
  }
}, [quizData, fetchExistingScore]);

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion._id,
      selectedOptionIndex: selectedOption,
      isCorrect
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowCorrectAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      setQuizCompleted(true);
      submitQuizResults();
    }
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setShowCorrectAnswer(false);
  };

  const fetchQuiz = useCallback(async () => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/quiz/${courseId}/fetchquizes/${quiz}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch quiz: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.quiz) {
        throw new Error('No quiz data received');
      }

      console.log(data.quiz)
      setQuizData(data.quiz);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, [courseId, quiz]);

  const submitQuizResults = async () => {
    if (!quizData) return;

    setSubmitting(true);
    
    try {
      const quizAttempt: QuizAttempt = {
        quizId: quizData._id,
        courseId: quizData.courseId,
        score: score,
        total: totalQuestions,
        answers: answers
      };

      const response = await fetch(`/api/quiz/${courseId}/savequizscore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizAttempt),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz results');
      }

      console.log("Quiz submitted successfully");
    } catch (error) {
      console.error("Error submitting quiz results:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setScore(0);
    setQuizCompleted(false);
    setShowCorrectAnswer(false);
    setSubmitting(false);
  };

  const getScorePercentage = () => {
    return totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Loading state
  if (loading || checkingExistingScore) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Quiz</h2>
          <p className="text-red-500 mb-4">{error || 'Failed to load quiz data'}</p>
          <button 
            onClick={fetchQuiz}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-xl transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Quiz completed state
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mt-13">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-600 mb-2">Quiz Completed!</h1>
            <p className="text-pink-500">Your results are in</p>
          </div>
          
          <div className="bg-pink-50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-pink-700">Final Score</span>
              <span className={`text-2xl font-bold ${getScoreColor()}`}>
                {score} / {totalQuestions} ({getScorePercentage()}%)
              </span>
            </div>
            <div className="w-full bg-pink-200 rounded-full h-4">
              <div 
                className="bg-pink-600 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${getScorePercentage()}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-pink-700 mb-4">Question Review</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quizData.questions.map((question, qIndex) => {
                const answer = answers.length > 0 ? answers.find(a => a.questionId === question._id) : null
                {
                    return (
                        <div 
                        key={question._id} 
                        className={`p-4 rounded-lg border ${
                            answer?.isCorrect 
                            ? 'border-green-200 bg-green-50' 
                            
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <p className="font-medium text-pink-800 mb-2">
                      {qIndex + 1}. {question.questionText}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => {
                        const isCorrect = oIndex === question.correctOptionIndex;
                        const isSelected = oIndex === answer?.selectedOptionIndex;
                        
                        return (
                          <div 
                            key={oIndex} 
                            className={`px-3 py-2 rounded-md ${
                              isCorrect 
                                ? 'bg-green-100 text-green-800 font-medium' 
                                : isSelected && !answer?.isCorrect
                                ? 'bg-red-100 text-red-800' 
                                : ''
                            }`}
                          >
                            {option}
                            {isCorrect && (
                              <span className="ml-2 text-green-600">✓ Correct</span>
                            )}
                            {isSelected && !answer?.isCorrect && (
                              <span className="ml-2 text-red-600">✗ Your answer</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }})}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={resetQuiz}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
              disabled={submitting}
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push(`/course/${courseId}/chapters`)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz question state
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-pink-600">No question available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mt-13">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-pink-600">{quizData.title}</h1>
          <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-pink-100 rounded-full h-2 mb-6">
          <div 
            className="bg-pink-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-pink-800 mb-4">
            {currentQuestion.questionText}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctOptionIndex;
              const isWrong = showCorrectAnswer && isSelected && !isCorrect;
              
              return (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition duration-200 ${
                    isSelected && !showCorrectAnswer
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-pink-200 hover:border-pink-300'
                  } ${
                    showCorrectAnswer && isCorrect 
                      ? 'border-green-400 bg-green-50' 
                      : ''
                  } ${
                    isWrong 
                      ? 'border-red-300 bg-red-50' 
                      : ''
                  } ${
                    showCorrectAnswer ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    <div className="flex gap-2">
                      {showCorrectAnswer && isCorrect && (
                        <span className="text-green-600 font-medium">✓ Correct</span>
                      )}
                      {isWrong && (
                        <span className="text-red-600 font-medium">✗ Your answer</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div>
            {showCorrectAnswer ? (
              <button
                onClick={handleNextQuestion}
                disabled={submitting}
                className="bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white font-bold py-3 px-6 rounded-xl transition duration-200"
              >
                {submitting 
                  ? 'Submitting...' 
                  : currentQuestionIndex < totalQuestions - 1 
                  ? 'Next Question' 
                  : 'Finish Quiz'
                }
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`${
                  selectedOption === null 
                    ? 'bg-pink-300 cursor-not-allowed' 
                    : 'bg-pink-600 hover:bg-pink-700'
                } text-white font-bold py-3 px-6 rounded-xl transition duration-200`}
              >
                Submit Answer
              </button>
            )}
          </div>

          <div className="text-pink-700 font-medium">
            Score: {score} / {totalQuestions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;