import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className,
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
        <textarea
          ref={ref}
          disabled={disabled}
          className={`
            w-full
            px-4
            py-2
            border
            border-gray-300 dark:border-gray-600
            rounded-md
            font-base
            text-base
            text-gray-900 dark:text-gray-100
            bg-white dark:bg-gray-800
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-purple-500/50 dark:focus:ring-purple-400/50
            focus:border-purple-500 dark:focus:border-purple-400
            disabled:opacity-50
            disabled:cursor-not-allowed
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            resize-vertical
            min-h-[100px]
            ${error ? 'border-red-600 dark:border-red-400 focus:ring-red-500/50' : ''}
            ${className || ''}
          `}
          {...props}
        />
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
