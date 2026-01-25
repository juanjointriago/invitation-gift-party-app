import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
  icon?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-gray-200 text-gray-800',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
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
