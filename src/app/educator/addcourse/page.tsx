"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiPlus, FiLoader, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useNotification } from '@/components/NotificationContext';
import { useUser } from '@/context/userContext';
import PleaseWait from '@/components/PleaseWait';

export default function AddCourse() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    level: 'beginner',
    language: 'english',
    prerequisites: '',
    learningOutcomes: '',
    certification: false,
    startDate: '',
    endDate: '',
    discount: '',
    totalSections: '',
    totalLectures: '',
    totalQuizzes: '',
    welcomeMessage: '',
    completionMessage: ''
  });
  const { showNotification } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, userLoading , fetchUserData } = useUser(); 
      
  
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
    useEffect(() => {  
      if(user && user.role !== "educator"  && !userLoading) return router.push("/unauthorized/educator")
    }, [ user , router , userLoading]);
  
  // function to add photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      showNotification('Please upload an image file (JPEG, PNG, etc.)', "error")
      return;
    }
    
    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      showNotification('File size must be less than 5MB', "error")
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.title || !formData.description) {
      showNotification('Title and description are required', "error")
      setIsLoading(false);
      return;
    }
    
    // Create FormData object
    const formPayload = new FormData();
    
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value.toString());
    });
    
    // Append file if exists
    if (file) {
      formPayload.append('imageUrl', file);
    }
    
    try {
      const response = await fetch('/api/educator/addcourse', {
        method: 'POST',
        body: formPayload,
        credentials: 'include' // For cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        showNotification(errorData.msg || 'Failed to create course', "error")
      }

      showNotification("Course created Successfully, Your course will be verified by our moderators")
      const data = await response.json();
      fetchUserData(); 
      return router.push(`/educator/${data.course._id}/addchapter`);
    } catch (error){
      showNotification('Submission error', "error");
    } finally {
      setIsLoading(false);
    }
  };

  
  const category = ["Programming", "Data Science", "Language", "Communication", "Ai" , "Machine Learning", "Business", "Design"];
  
  return (
    <>
    <div className="min-h-screen py-4 px-2 sm:py-8 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white shadow rounded-lg overflow-hidden mt-4 sm:mt-10 mx-2 sm:mx-0">
          {/* Header */}
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-pink-700">Create New Course</h2>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Fill in the details to add a new course</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 space-y-4 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-sm sm:text-base text-red-700">{error}</p>
              </div>
            )}

            {/* Course Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Thumbnail (Max 5MB)
              </label>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 mx-auto sm:mx-0">
                  {previewUrl ? (
                    <>
                      <Image 
                        src={previewUrl} 
                        alt="Preview" 
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiUpload className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer w-full sm:w-auto mx-5">
                  <div className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm flex items-center justify-center">
                    <FiPlus className="mr-2 w-4 h-4" />
                    <span className="text-sm">Upload Image</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                required
              />
            </div>

            {/* Prerequisites */}
            <div>
              <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700">
                Prerequisites | <span className="text-xs text-gray-500">Use Dots . for new pointers</span>
              </label>
              <textarea
                id="prerequisites"
                name="prerequisites"
                rows={3}
                value={formData.prerequisites}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                placeholder="What students should know before taking this course"
              />
            </div>

            {/* Learning Outcomes */}
            <div>
              <label htmlFor="learningOutcomes" className="block text-sm font-medium text-gray-700">
                Learning Outcomes | <span className="text-xs text-gray-500">Use Dots . for new pointers</span>
              </label>
              <textarea
                id="learningOutcomes"
                name="learningOutcomes"
                rows={3}
                value={formData.learningOutcomes}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                placeholder="What students will learn from this course"
              />
            </div>

            {/* Welcome Message */}
            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
                Welcome Message
              </label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                rows={2}
                value={formData.welcomeMessage}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                placeholder="Message students will see when they enroll"
              />
            </div>

            {/* Completion Message */}
            <div>
              <label htmlFor="completionMessage" className="block text-sm font-medium text-gray-700">
                Completion Message
              </label>
              <textarea
                id="completionMessage"
                name="completionMessage"
                rows={2}
                value={formData.completionMessage}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                placeholder="Message students will see when they complete the course"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Column 1 */}
              <div className="space-y-4 sm:space-y-6">
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                  >
                    <option value="">Select a category</option>
                    {category.map((cat, index) => (
                      <option value={cat} key={index}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                    required
                  />
                </div>

                {/* Discount */}
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                  />
                </div>

                {/* Level */}
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                    Difficulty Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Certification */}
                <div className="flex items-center">
                  <input
                    id="certification"
                    name="certification"
                    type="checkbox"
                    checked={formData.certification}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="certification" className="ml-2 block text-sm text-gray-700">
                    Offers Certification
                  </label>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4 sm:space-y-6">
                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    value={formData.duration}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                    required
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                  />
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base p-2 sm:p-3 border"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>

                {/* Course Structure */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="totalSections" className="block text-xs font-medium text-gray-700">
                      Sections
                    </label>
                    <input
                      type="number"
                      id="totalSections"
                      name="totalSections"
                      min="0"
                      value={formData.totalSections}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1 sm:p-2 border"
                    />
                  </div>
                  <div>
                    <label htmlFor="totalLectures" className="block text-xs font-medium text-gray-700">
                      Lectures
                    </label>
                    <input
                      type="number"
                      id="totalLectures"
                      name="totalLectures"
                      min="0"
                      value={formData.totalLectures}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1 sm:p-2 border"
                    />
                  </div>
                  <div>
                    <label htmlFor="totalQuizzes" className="block text-xs font-medium text-gray-700">
                      Quizzes
                    </label>
                    <input
                      type="number"
                      id="totalQuizzes"
                      name="totalQuizzes"
                      min="0"
                      value={formData.totalQuizzes}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1 sm:p-2 border"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-700 hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin mr-2 w-4 h-4" />
                    Creating Course...
                  </>
                ) : (
                  'Create Course'
                )}
              </button>
            </div>
              {isLoading && <PleaseWait message={"Saving Course"}/> }
          </form>
        </div>
      </div>
    </div>
</>
  );
}