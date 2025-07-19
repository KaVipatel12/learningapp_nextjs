"use client";

import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

type SearchProps = {
  onSearch: (filters: {
    courseName: string;
    educatorName: string;
    page: string;
  }) => void;
};

export function SearchSection({ onSearch }: SearchProps) {
  const [courseSearch, setCourseSearch] = useState('');
  const [educatorSearch, setEducatorSearch] = useState('');
  
  // Memoize the onSearch callback to prevent unnecessary re-renders
  const stableOnSearch = useCallback(onSearch, [onSearch]);
  
  // Create debounced function with useMemo to prevent recreation on every render
  const debouncedSearch = useMemo(
    () => debounce((courseName: string, educatorName: string) => {
      stableOnSearch({
        courseName,
        educatorName,
        page: '1' // Reset to first page on search
      });
    }, 500), // Increased debounce time to reduce API calls
    [stableOnSearch]
  );

  // Handle course search change
  const handleCourseSearchChange = useCallback((value: string) => {
    setCourseSearch(value);
    debouncedSearch(value, educatorSearch);
  }, [debouncedSearch, educatorSearch]);

  // Handle educator search change
  const handleEducatorSearchChange = useCallback((value: string) => {
    setEducatorSearch(value);
    debouncedSearch(courseSearch, value);
  }, [debouncedSearch, courseSearch]);

  // Clear course search
  const clearCourseSearch = useCallback(() => {
    setCourseSearch('');
    debouncedSearch('', educatorSearch);
  }, [debouncedSearch, educatorSearch]);

  // Clear educator search
  const clearEducatorSearch = useCallback(() => {
    setEducatorSearch('');
    debouncedSearch(courseSearch, '');
  }, [debouncedSearch, courseSearch]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={courseSearch}
          onChange={(e) => handleCourseSearchChange(e.target.value)}
          placeholder="Search by course name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        {courseSearch && (
          <button 
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            onClick={clearCourseSearch}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <input
          type="text"
          value={educatorSearch}
          onChange={(e) => handleEducatorSearchChange(e.target.value)}
          placeholder="Search by educator name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        {educatorSearch && (
          <button 
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            onClick={clearEducatorSearch}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}