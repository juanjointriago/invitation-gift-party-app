import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-400 active:bg-purple-800 dark:active:bg-purple-600 shadow-sm dark:shadow-purple-900/20',
  secondary: 'bg-purple-400 dark:bg-purple-600 text-white hover:bg-purple-500 dark:hover:bg-purple-500 active:bg-purple-600 dark:active:bg-purple-700 shadow-sm',
  accent: 'bg-pink-600 dark:bg-pink-500 text-white hover:bg-pink-700 dark:hover:bg-pink-400 active:bg-pink-800 dark:active:bg-pink-600 shadow-sm dark:shadow-pink-900/20',
  ghost: 'bg-transparent text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-zinc-600 active:bg-purple-200 dark:active:bg-zinc-500',
  outline: 'bg-transparent border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-zinc-600/50 active:bg-purple-100 dark:active:bg-zinc-500/50',
  danger: 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-400 active:bg-red-800 dark:active:bg-red-600 shadow-sm dark:shadow-red-900/20',
};

const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          btn-base
          rounded-md
          font-medium
          transition-all
          duration-200
          flex
          items-center
          justify-center
          gap-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className || ''}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {leftIcon && !isLoading && <span>{leftIcon}</span>}
        {children}
        {rightIcon && !isLoading && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
