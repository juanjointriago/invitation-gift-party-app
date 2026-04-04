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
        bg-white dark:bg-zinc-800
        border-gray-300 dark:border-zinc-600
        ${hoverable ? 'hover:shadow-xl dark:hover:shadow-zinc-900/70 cursor-pointer transition-shadow duration-200' : ''}
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
  <div className={`border-b border-gray-300 dark:border-zinc-600 pb-4 mb-4 ${className || ''}`}>
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
  <div className={`border-t border-gray-300 dark:border-zinc-600 pt-4 mt-4 ${className || ''}`}>
    {children}
  </div>
);
