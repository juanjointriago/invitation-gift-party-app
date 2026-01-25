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
          <label className="block text-sm font-medium text-text mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
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
              border-border
              rounded-md
              font-base
              text-base
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-primary/50
              focus:border-primary
              disabled:bg-gray-100
              disabled:cursor-not-allowed
              disabled:text-text-muted
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-error focus:ring-error/50' : ''}
              ${className || ''}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-error text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-text-muted text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
