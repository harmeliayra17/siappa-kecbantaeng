import React, { memo } from 'react';

/**
 * Reusable Card Component
 * @param {string} variant - 'default', 'hover', 'shadow'
 * @param {ReactNode} children - Card content
 */
function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}) {
  const baseStyles = 'rounded-lg bg-white card-clean';

  const variants = {
    default: 'border border-mediumGray',
    hover: 'border border-mediumGray hover:shadow-lg hover-lift cursor-pointer',
    shadow: 'shadow-medium',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default memo(Card);
