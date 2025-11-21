import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showQuickJump?: boolean;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showQuickJump = true 
}: PaginationProps) {
  
  const renderPageButtons = () => {
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

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      {/* Page Info */}
      <div className="text-sm text-gray-600 font-medium">
        Page {currentPage} of {totalPages}
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-200 hover:from-pink-200 hover:to-rose-200 hover:shadow-md transform hover:scale-105 disabled:transform-none disabled:hover:shadow-none font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {renderPageButtons().map((page, index) => {
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
                onClick={() => onPageChange(page as number)}
                className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center transition-all duration-200 font-semibold ${
                  currentPage === page 
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-110 hover:from-pink-600 hover:to-rose-600" 
                    : "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 hover:from-pink-100 hover:to-rose-100 hover:shadow-md transform hover:scale-105"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-200 hover:from-pink-200 hover:to-rose-200 hover:shadow-md transform hover:scale-105 disabled:transform-none disabled:hover:shadow-none font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump to First/Last */}
      {showQuickJump && totalPages > 5 && (
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-4 py-1.5 rounded-lg bg-pink-50 text-pink-600 disabled:opacity-40 hover:bg-pink-100 transition-all duration-200 font-medium hover:shadow-sm"
          >
            First Page
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-1.5 rounded-lg bg-pink-50 text-pink-600 disabled:opacity-40 hover:bg-pink-100 transition-all duration-200 font-medium hover:shadow-sm"
          >
            Last Page
          </button>
        </div>
      )}
    </div>
  );
}
