import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingSpinnerProps {
  height?: string; 
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ height = 'min-h-screen' }) => {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <FiLoader className="animate-spin text-2xl" />
    </div>
  );
};

export default LoadingSpinner;