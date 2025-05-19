'use client';
import { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import Card from '@/components/Card';
import { useNotification } from '@/components/NotificationContext';
import Link from 'next/link';
import Modal from '@/components/Modal';
import UserNav from '@/components/Navbar/UserNav';
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
  averageRating? : number;
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
    } catch  {
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
    } catch  {
      showNotification('Network error', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const isPurchased = (courseId : string) => {
    return purchasedCoursesIds.some(id  => id.toString() === courseId)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-24"> {/* Added pb-24 for bottom padding */}
      <UserNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center mb-8 mt-9">
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Start adding courses to your wishlist!</p>
            <div className="mt-6">
              <Link
                href="/course"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-center flex-wrap gap-6 pb-20"> {/* Added pb-20 for bottom padding */}
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
        )}
      </div>

      {/* Fixed Purchase Button Container */}
      {courses.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{courses.length} courses in wishlist</p>
              <p className="font-medium">
                Total: ${courses.reduce((sum, course) => sum + (course.discountedPrice || course.price), 0).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Purchase All Courses
            </button>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Confirm Purchase"
      >
        <div className="space-y-4">
          <p>Are you sure you want to purchase all {courses.length} courses in your wishlist?</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">Total Amount: ${courses.reduce((sum, course) => sum + (course.discountedPrice || course.price), 0).toFixed(2)}</p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchaseAll}
              disabled={purchasing}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 flex items-center gap-2"
            >
              {purchasing ? 'Processing...' : 'Confirm Purchase'}
              {purchasing && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}