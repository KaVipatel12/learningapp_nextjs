'use client';
import { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react';
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
  const { purchasedCoursesIds } = useUser();

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
        showNotification('All courses purchased successfully!', 'success');
        setCourses([]);
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

  const totalPrice = courses.reduce((sum, course) => sum + (course.discountedPrice || course.price), 0);

  return (
    <div className="min-h-screen">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 mt-10">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">
            My Wishlist
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-rose-500 mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-rose-100 max-w-2xl mx-auto">
            <Heart className="mx-auto h-16 w-16 text-rose-300" strokeWidth={1.5} />
            <h3 className="mt-6 text-2xl font-medium text-rose-900">Your wishlist is empty</h3>
            <p className="mt-2 text-rose-800/80">Start adding courses to your wishlist!</p>
            <div className="mt-8">
              <Link
                href="/course"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 text-white rounded-lg text-sm font-medium shadow-md transition-all"
              >
                Browse Courses
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-20 place-items-center">
              {courses.map((course) => (
                <Card
                  key={course._id}
                  id={course._id}
                  imageUrl={course.imageUrl}
                  title={course.title}
                  instructor={course.instructor}
                  price={course.price}
                  discountedPrice={course.discountedPrice}
                  rating={course.averageRating || 0}
                  totalRatings={course.totalRatings || 0}
                  isWishlisted={true}
                  onWishlistToggle={() => {}}
                  isPurchased={isPurchased(course._id)}
                />
              ))}
            </div>

            {/* Fixed Purchase Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-rose-100 py-4 px-6">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-rose-700/80">
                    {courses.length} {courses.length === 1 ? 'course' : 'courses'} in wishlist
                  </p>
                  <p className="text-lg font-semibold text-rose-900">
                    Total: ${totalPrice.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-md transition-all"
                >
                  <ShoppingCart size={20} />
                  Purchase All Courses
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
        title="Confirm Purchase"
      >
        <div className="space-y-6">
          <p className="text-rose-800">
            Are you sure you want to purchase all {courses.length} courses in your wishlist?
          </p>
          
          <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
            <p className="font-semibold text-rose-900">
              Total Amount: ${totalPrice.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="px-4 py-2 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchaseAll}
              disabled={purchasing}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:to-rose-600 text-white rounded-lg disabled:opacity-80 flex items-center gap-2 transition-all"
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
                'Confirm Purchase'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}