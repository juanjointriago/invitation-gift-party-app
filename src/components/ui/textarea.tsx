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
          <label className="block text-sm font-medium text-text mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
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
            resize-vertical
            min-h-[100px]
            ${error ? 'border-error focus:ring-error/50' : ''}
            ${className || ''}
          `}
          {...props}
        />
        {error && <p className="text-error text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-text-muted text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
