'use client';
import { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import Card from '@/components/Card';
import { useNotification } from '@/components/NotificationContext';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { useUser } from '@/context/userContext';

interface Course {
  _id: string;
  imageUrl: string;
  title: string;
  instructor: string;
  price: number;
  discountedPrice?: number;
  rating?: number;
  totalRatings?: number;
  averageRating?: number;
}

export default function WishlistPage() {
  const { showNotification } = useNotification();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const { purchasedCoursesIds , fetchUserData } = useUser();
  
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/wishlist');
      const data = await response.json();
      if (response.ok) {
        setCourses(data.msg);
      } else {
        showNotification(data.msg || 'Failed to load wishlist', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handlePurchaseAll = async () => {
    try {
      setPurchasing(true);
      const response = await fetch('/api/user/purchasecourse', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: courses.map(course => course._id) }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification('Enrolled in all courses successfully!', 'success');
        setCourses([]);
        fetchUserData();
        setShowPurchaseModal(false);
      } else {
        showNotification(data.msg || 'Purchase failed', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const isPurchased = (courseId: string) => {
    return purchasedCoursesIds.some(id => id.toString() === courseId);
  };

  return (
    <div className="min-h-screen animate-fade-in">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Welcome Message */}
        <div className="mb-8 mt-10">
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white fill-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">My Wishlist</h1>
                  <p className="text-pink-100">Your collection of favorite courses</p>
                </div>
              </div>
              
              {courses.length > 0 && (
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-lg font-medium">{courses.length} {courses.length === 1 ? 'course' : 'courses'} waiting for you</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100 max-w-2xl mx-auto animate-fade-in">
            <div className="inline-flex p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full mb-6">
              <Heart className="h-20 w-20 text-rose-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Your wishlist is empty
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Start adding courses to your wishlist and build your learning journey!
            </p>
            <Link
              href="/course"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Browse Courses
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-24">
              {courses.map((course) => (
                <Card
                  key={course._id}
                  id={course._id}
                  imageUrl={course.imageUrl}
                  title={course.title}
                  instructor={course.instructor}
                  rating={course.averageRating || 0}
                  totalRatings={course.totalRatings || 0}
                  isWishlisted={true}
                  onWishlistToggle={async () => {
                    await fetchWishlist();
                    return true;
                  }}
                  isPurchased={isPurchased(course._id)}
                />
              ))}
            </div>

            {/* Fixed Purchase Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-2xl border-t border-gray-200 py-4 px-6 z-50">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 font-medium">
                    {courses.length} {courses.length === 1 ? 'course' : 'courses'} in wishlist
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    All Free
                  </p>
                </div>
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-600 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <ShoppingCart size={22} />
                  Enroll in All Courses
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Confirm Enrollment"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Are you sure you want to enroll in all {courses.length} courses in your wishlist?
          </p>
          
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border-2 border-pink-200">
            <p className="font-bold text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              All Courses are Free!
            </p>
            <p className="text-gray-700 mt-2">Start learning today at no cost</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchaseAll}
              disabled={purchasing}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg disabled:opacity-70 flex items-center gap-2 font-semibold shadow-md transition-all"
            >
              {purchasing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Confirm Enrollment'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}