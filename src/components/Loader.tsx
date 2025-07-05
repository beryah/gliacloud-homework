import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Loader: React.FC<LoaderProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} mb-4`}
      />
      <p className="text-lg text-gray-300">{message}</p>
    </div>
  );
};