"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/Card";
import { FilterBar } from "@/components/CourseSearchPage/FilterBar";
import { SearchSection } from "@/components/CourseSearchPage/SearchSection";
import { Course, useUser } from "@/context/userContext";
import { WishList } from "../page";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CoursesPage() {
  const [filters, setFilters] = useState({
    courseName: "",
    educatorName: "",
    category: "",
    price: "",
    page: "1",
    limit: "6", 
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [userWishlist, setUserWishList] = useState<WishList[]>([]);
  const { purchasedCoursesIds, user, userLoading } = useUser();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) query.set(key, value);
      });

      const res = await fetch(`/api/course/fetchcourse?${query.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();

      if (Array.isArray(data.msg)) {
        const formatted = data.msg.map((course: Course) => ({
          id: course._id ?? course.id,
          imageUrl: course.imageUrl || "/default-course.jpg",
          title: course.title,
          instructor: course.educatorName || "Unknown Instructor",
          price: course.price,
          rating: course.averageRating || 0,
          totalRatings: course.totalRatings || 0,
          discountedPrice: course.discountedPrice || course.price,
        }));

        // Always replace courses for pagination (no more infinite scroll)
        setCourses(formatted);

        // Update pagination from backend response
        setPagination({
          currentPage: data.currentPage || parseInt(filters.page),
          totalPages: data.totalPages || 1,
        });
      } else if (data.msg === "No courses found") {
        setCourses([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
        });
      } else {
        console.warn("Unexpected data format", data);
        setCourses([]);
        setError("Received unexpected data format from server");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (user?.wishlist) {
      const userWishlist = user.wishlist.map(id => id);
      setUserWishList(userWishlist); 
    }
  }, [user, userLoading]);

  const isPurchased = (courseId: string) => {
    return purchasedCoursesIds.some(id => id.toString() === courseId);
  };

  const isWishlisted = (courseId: string) => {
    return userWishlist.some(id => id.toString() === courseId);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page: page.toString() }));
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: "1" }));
  }, []);

  const renderPaginationButtons = () => {
    const { currentPage, totalPages } = pagination;
    const buttons = [];
    
    // Always show first page
    if (totalPages > 1) {
      buttons.push(1);
    }
    
    // Add ellipsis and current page area if needed
    if (currentPage > 3) {
      buttons.push('...');
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!buttons.includes(i)) {
        buttons.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      if (!buttons.includes('...')) {
        buttons.push('...');
      }
    }
    
    // Always show last page if there are multiple pages
    if (totalPages > 1 && !buttons.includes(totalPages)) {
      buttons.push(totalPages);
    }
    
    return buttons;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-pink-100 mt-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Explore Courses
          </h1>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <SearchSection
              onSearch={(newFilters) => handleFilterChange(newFilters)}
            />
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner height="h-12" />
            </div>
          ) : (
            <>
              {/* Course Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    id={course.id}
                    imageUrl={course.imageUrl}
                    title={course.title}
                    instructor={course.instructor}
                    price={course.price}
                    rating={course.rating || 0}
                    totalRatings={course.totalRatings || 0}
                    discountedPrice={course.discountedPrice}
                    isWishlisted={isWishlisted(course.id)}
                    isPurchased={isPurchased(course.id)}
                    onWishlistToggle={() => {}}
                  />
                ))}
              </div>

              {/* Empty State */}
              {courses.length === 0 && !loading && (
                <div className="text-center py-10 bg-pink-50 rounded-lg">
                  <p className="text-pink-600 text-lg mb-4">
                    No courses found matching your criteria.
                  </p>
                  <button 
                    onClick={() => setFilters({
                      courseName: "",
                      educatorName: "",
                      category: "",
                      price: "",
                      page: "1",
                      limit: "6",
                    })}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {!loading && courses.length > 0 && pagination.totalPages > 1 && (
                <div className="flex flex-col items-center space-y-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 hover:from-pink-200 hover:to-rose-200"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {renderPaginationButtons().map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                              pagination.currentPage === page 
                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-110" 
                                : "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 hover:from-pink-100 hover:to-rose-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 hover:from-pink-200 hover:to-rose-200"
                    >
                      Next
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                  </div>

                  {/* Quick Jump to First/Last */}
                  {pagination.totalPages > 5 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1 rounded-md bg-pink-50 text-pink-600 disabled:opacity-50 hover:bg-pink-100 transition-colors duration-200"
                      >
                        First
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1 rounded-md bg-pink-50 text-pink-600 disabled:opacity-50 hover:bg-pink-100 transition-colors duration-200"
                      >
                        Last
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}