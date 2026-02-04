import React from 'react';
import { LogOut } from 'lucide-react';

/**
 * Panic Button Component - "Keluar Cepat" button
 * Redirects user to safe website when emergency
 */
export default function PanicButton({ className = '', showLabel = true, size = 'md' }) {
  const handlePanic = () => {
    // Redirect to safe website
    window.location.replace('https://www.google.com');
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs md:text-sm',
    md: 'px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={handlePanic}
      className={`inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold rounded-full transition shadow-md hover:shadow-lg hover:-translate-y-0.5 ${sizeStyles[size]} ${className}`}
      title="Tekan untuk pergi ke website aman"
    >
      <LogOut size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
      {showLabel && <span>Keluar Cepat</span>}
    </button>
  );
}
