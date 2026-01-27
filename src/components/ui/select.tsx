import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className,
      disabled,
      options,
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            {label}
            {props.required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
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
            disabled:bg-gray-100 dark:disabled:bg-zinc-800
            disabled:cursor-not-allowed
            disabled:text-gray-400 dark:disabled:text-zinc-500
            appearance-none
            ${error ? 'border-red-600 dark:border-red-400 focus:ring-red-500/50' : ''}
            ${className || ''}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
