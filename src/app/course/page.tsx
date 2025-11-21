"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/Card";
import { FilterBar } from "@/components/CourseSearchPage/FilterBar";
import { SearchSection } from "@/components/CourseSearchPage/SearchSection";
import { Course, useUser } from "@/context/userContext";
import { WishList } from "../page";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/ui/pagination";

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
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-elegant border border-pink-100 mt-10 hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-12 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
              Explore Courses
            </h1>
          </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 pb-20 place-items-center">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    id={course.id}
                    imageUrl={course.imageUrl || ""}
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
                <div className="text-center py-16 bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl border-2 border-pink-100 animate-fade-in">
                  <div className="mb-6">
                    <div className="inline-flex p-6 bg-white rounded-full shadow-md">
                      <svg className="w-16 h-16 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-pink-900 mb-2">No courses found</h3>
                  <p className="text-pink-600 text-lg mb-6">
                    No courses match your search criteria. Try adjusting your filters.
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
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200 hover:shadow-rose-glow"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {!loading && courses.length > 0 && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}