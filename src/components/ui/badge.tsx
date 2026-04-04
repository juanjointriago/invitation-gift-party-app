import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
  icon?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-500',
  primary: 'bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-600',
  secondary: 'bg-purple-100 dark:bg-purple-700 text-purple-800 dark:text-purple-100 border border-purple-200 dark:border-purple-500',
  success: 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 border border-green-300 dark:border-green-600',
  error: 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 border border-red-300 dark:border-red-600',
  warning: 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-600',
  info: 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-600',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  icon,
}) => {
  return (
    <span
      className={`
        badge-base
        ${variantClasses[variant]}
        ${className || ''}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};
