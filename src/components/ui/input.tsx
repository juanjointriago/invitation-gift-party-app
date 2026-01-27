import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      fullWidth = false,
      className,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={`
              w-full
              px-4
              py-2
              border
              border-gray-300 dark:border-zinc-600
              rounded-md
              font-base
              text-base
              text-gray-900 dark:text-zinc-100
              bg-white dark:bg-zinc-700
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-purple-500/50 dark:focus:ring-purple-400/50
              focus:border-purple-500 dark:focus:border-purple-400
              disabled:opacity-50
              disabled:cursor-not-allowed
              placeholder:text-gray-400 dark:placeholder:text-zinc-400
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-600 dark:border-red-400 focus:ring-red-500/50' : ''}
              ${className || ''}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
