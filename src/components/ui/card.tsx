import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg shadow-md border p-6
        bg-white dark:bg-zinc-700
        border-gray-200 dark:border-zinc-600
        ${hoverable ? 'hover:shadow-lg dark:hover:shadow-zinc-900/50 cursor-pointer transition-shadow duration-200' : ''}
        ${className || ''}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`border-b border-gray-200 dark:border-zinc-600 pb-4 mb-4 ${className || ''}`}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={className}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`border-t border-gray-200 dark:border-zinc-600 pt-4 mt-4 ${className || ''}`}>
    {children}
  </div>
);
