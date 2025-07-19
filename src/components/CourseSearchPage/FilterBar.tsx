"use client";

import { useCallback } from 'react';

type Filters = {
  category?: string;
  price?: string;
  courseName?: string;
  educatorName?: string;
  page?: string;
};

type FilterBarProps = {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
};

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const categories = [
    "Programming",
    "Design", 
    "Business",
    "Marketing",
    "Photography",
    "Music"
  ];

  const priceRanges = [
    { label: "All Prices", value: "" },
    { label: "Under ₹500", value: "500" },
    { label: "Under ₹1000", value: "1000" },
    { label: "Under ₹2000", value: "2000" },
    { label: "Under ₹5000", value: "5000" }
  ];

  // Memoize the change handler to prevent unnecessary re-renders
  const handleChange = useCallback((name: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [name]: value,
      page: "1" // Reset to first page when filter changes
    });
  }, [filters, onFilterChange]);

  // Memoize the reset handler
  const handleReset = useCallback(() => {
    onFilterChange({
      courseName: "",
      educatorName: "",
      category: "",
      price: "",
      page: "1"
    });
  }, [onFilterChange]);

  // Memoize individual filter clear handlers
  const clearCategory = useCallback(() => handleChange("category", ""), [handleChange]);
  const clearPrice = useCallback(() => handleChange("price", ""), [handleChange]);
  const clearCourseName = useCallback(() => handleChange("courseName", ""), [handleChange]);
  const clearEducatorName = useCallback(() => handleChange("educatorName", ""), [handleChange]);

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm mb-4 border border-pink-100">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 w-full">
          <label htmlFor="category-filter" className="block text-sm font-medium text-pink-700 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            value={filters.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500 bg-white transition-colors duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full">
          <label htmlFor="price-filter" className="block text-sm font-medium text-pink-700 mb-1">
            Price Range
          </label>
          <select
            id="price-filter"
            value={filters.price || ""}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500 bg-white transition-colors duration-200"
          >
            {priceRanges.map((range) => (
              <option key={range.value || "all"} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-none self-end mt-4 md:mt-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-md hover:from-pink-200 hover:to-rose-200 text-pink-700 font-medium transition-all duration-200 flex items-center shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All
          </button>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {(filters.category || filters.price || filters.courseName || filters.educatorName) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 border border-pink-200">
              Category: {filters.category}
              <button 
                onClick={clearCategory}
                className="ml-2 text-pink-500 hover:text-pink-700 transition-colors duration-200"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.price && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
              Under ₹{filters.price}
              <button 
                onClick={clearPrice}
                className="ml-2 text-rose-500 hover:text-rose-700 transition-colors duration-200"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.courseName && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              Course: `{filters.courseName}`
              <button 
                onClick={clearCourseName}
                className="ml-2 text-purple-500 hover:text-purple-700 transition-colors duration-200"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.educatorName && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              Educator: `{filters.educatorName}`
              <button 
                onClick={clearEducatorName}
                className="ml-2 text-amber-500 hover:text-amber-700 transition-colors duration-200"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}