import React from 'react';
import './LoadingSpinner.css'; // Opcional para estilos personalizados

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#3b82f6',
  className = ''
}) => {
  const sizeMap = {
    small: 'h-5 w-5',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeMap[size]}`}
        style={{ borderColor: color }}
      />
    </div>
  );
};