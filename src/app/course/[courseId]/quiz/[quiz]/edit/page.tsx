"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface QuizData {
  _id: string;
  courseId: string;
  title: string;
  questions: Question[];
}

const EditQuizPage = () => {
  const { courseId, quiz } = useParams();
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData>({
    _id: '',
    courseId: courseId as string,
    title: "",
    questions: [{
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0
    }]
  });
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch quiz data on component mount
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
const response = await axios.get(
  `/api/quiz/${courseId}/fetchquizes/${quiz}`,
  { withCredentials: true }
);
        setQuizData(response.data.quiz);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setSubmissionStatus({
          success: false,
          message: "Failed to load quiz data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [courseId, quiz]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizData({...quizData, title: e.target.value});
  };

  const handleQuestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index].questionText = e.target.value;
    setQuizData({...quizData, questions: newQuestions});
  };

  const handleOptionChange = (
    qIndex: number, 
    oIndex: number, 
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options[oIndex] = e.target.value;
    setQuizData({...quizData, questions: newQuestions});
  };

  const handleCorrectAnswerChange = (qIndex: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].correctOptionIndex = parseInt(e.target.value);
    setQuizData({...quizData, questions: newQuestions});
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0
        }
      ]
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...quizData.questions];
    newQuestions.splice(index, 1);
    setQuizData({...quizData, questions: newQuestions});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/api/quiz/${courseId}/fetchquizes/${quiz}/editquiz`,
        quizData
      );
      setSubmissionStatus({
        success: true,
        message: "Quiz updated successfully!"
      });
      console.log("Data sent to backend:", response.data);
      
      // // Redirect after successful update (optional)
      // setTimeout(() => {
      //   router.push(`/course/${courseId}/quizzes`);
      // }, 1500);
    } catch (error) {
      setSubmissionStatus({
        success: false,
        message: "Failed to update quiz. Please try again."
      });
      console.error("Error updating quiz:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-pink-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">Edit Quiz</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md shadow-pink-100">
        <div className="mb-6">
          <label className="block text-pink-600 font-bold mb-2">Quiz Title:</label>
          <input
            type="text"
            value={quizData.title}
            onChange={handleTitleChange}
            placeholder="Enter quiz title"
            className="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none"
            required
          />
        </div>

        {quizData.questions.map((question, qIndex) => (
          <div key={qIndex} className="mb-8 p-4 border-2 border-pink-200 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-pink-600">Question {qIndex + 1}</h3>
              {quizData.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-pink-600 font-bold mb-2">Question Text:</label>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(qIndex, e)}
                placeholder="Enter your question"
                className="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-pink-600 font-bold mb-2">Options:</label>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                    placeholder={`Option ${oIndex + 1}`}
                    className="w-full p-2 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none"
                    required
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-pink-600 font-bold mb-2">Correct Answer:</label>
              <select
                value={question.correctOptionIndex}
                onChange={(e) => handleCorrectAnswerChange(qIndex, e)}
                className="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none bg-white"
              >
                {question.options.map((_, oIndex) => (
                  <option key={oIndex} value={oIndex}>
                    Option {oIndex + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-pink-300 hover:bg-pink-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Add Another Question
          </button>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/course/${courseId}/quizzes`)}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        {submissionStatus && (
          <div className={`mt-6 text-center font-bold ${
            submissionStatus.success ? 'text-green-500' : 'text-red-500'
          }`}>
            {submissionStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default EditQuizPage;