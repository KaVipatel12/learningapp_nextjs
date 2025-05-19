"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/Card";
import { FilterBar } from "@/components/CourseSearchPage/FilterBar";
import { SearchSection } from "@/components/CourseSearchPage/SearchSection";
import UserNav from "@/components/Navbar/UserNav";
import { useUser } from "@/context/userContext";
import { Course, WishList } from "../page";


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
      >
        Previous
      </button>
      
      <div className="flex space-x-1">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => onPageChange(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default function CoursesPage() {
  const [filters, setFilters] = useState({
    courseName: "",
    educatorName: "",
    category: "",
    price: "",
    page: "1",
    limit: "8",
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [userWishlist , setUserWishList] = useState<WishList[]>([])
  const {purchasedCoursesIds , user , userLoading} = useUser(); 

  const totalPages = Math.max(1, Math.ceil(totalCourses / parseInt(filters.limit)));

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.set(key, value);
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
        setCourses(formatted);
        setTotalCourses(data.totalCourses || formatted.length);
      } else if (data.msg === "No courses found") {
        setCourses([]);
        setTotalCourses(0);
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
  
  const isPurchased = (courseId : string) => {
    return purchasedCoursesIds.some(id  => id.toString() === courseId)
  }

  const isWishlisted = (courseId : string) => {
    return userWishlist.some(id  => id.toString() === courseId)
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page: page.toString() }));
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Explore Courses</h1>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <SearchSection
            onSearch={(newFilters) =>
              setFilters((prev) => ({ ...prev, ...newFilters }))
            }
          />
          <FilterBar
            filters={filters}
            onFilterChange={(newFilters) =>
              setFilters((prev) => ({ ...prev, ...newFilters }))
            }
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Course Grid */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
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
              <div className="text-center py-10 bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-lg">
                  No courses found matching your criteria.
                </p>
                <button 
                  onClick={() => setFilters({
                    courseName: "",
                    educatorName: "",
                    category: "",
                    price: "",
                    page: "1",
                    limit: "8",
                  })}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && courses.length > 0 && (
              <Pagination 
                currentPage={parseInt(filters.page || "1")}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}