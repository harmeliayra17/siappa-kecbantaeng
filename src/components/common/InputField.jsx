import React from 'react';

/**
 * Reusable Input Field Component
 * @param {string} label - Label text
 * @param {string} type - Input type (text, email, password, textarea, select)
 * @param {string} error - Error message
 * @param {ReactNode} children - For select/textarea children
 */
export default function InputField({
  label,
  type = 'text',
  error,
  required = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const baseInputStyles = 'w-full px-4 py-2.5 border border-mediumGray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-surface disabled:cursor-not-allowed font-medium';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          className={`${baseInputStyles} ${errorStyles} ${className} resize-none`}
          disabled={disabled}
          {...props}
        />
      );
    } else if (type === 'select') {
      return (
        <select
          className={`${baseInputStyles} ${errorStyles} ${className}`}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
      );
    } else {
      return (
        <input
          type={type}
          className={`${baseInputStyles} ${errorStyles} ${className}`}
          disabled={disabled}
          {...props}
        />
      );
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-heading mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <p className="text-red-500 text-xs font-medium mt-1.5">{error}</p>}
    </div>
  );
}
