import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
  icon?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  primary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  secondary: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
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
