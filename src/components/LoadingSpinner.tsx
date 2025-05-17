import React from 'react';

interface LoadingSpinnerProps {
  height?: string; 
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ height = 'min-h-screen' }) => {
  return (
          <div className={`flex justify-center items-center h-64 ${height}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
  );
};

export default LoadingSpinner;