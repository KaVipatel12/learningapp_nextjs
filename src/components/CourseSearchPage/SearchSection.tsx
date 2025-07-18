"use client";

import { useState, useEffect } from 'react';
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
  
  // Create debounced function once and memoize it
  const debouncedSearch = debounce(() => {
    onSearch({
      courseName: courseSearch,
      educatorName: educatorSearch,
      page: '1' // Reset to first page on search
    });
  }, 300); // Reduced debounce time for more responsive feel

  useEffect(() => {
    debouncedSearch();
    // Cleanup debounce on unmount
    return () => debouncedSearch.cancel();
  }, [courseSearch, educatorSearch, debouncedSearch]);

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
          onChange={(e) => setCourseSearch(e.target.value)}
          placeholder="Search by course name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        {courseSearch && (
          <button 
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            onClick={() => setCourseSearch('')}
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
          onChange={(e) => setEducatorSearch(e.target.value)}
          placeholder="Search by educator name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        {educatorSearch && (
          <button 
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            onClick={() => setEducatorSearch('')}
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