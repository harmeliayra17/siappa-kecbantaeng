import React, { memo } from 'react';

/**
 * Stat Widget Component - Display statistics cards
 * Used in Dashboard for showing key metrics
 */
function StatWidget({
  icon: Icon,
  label,
  value,
  trend,
  color = 'purple',
  className = '',
}) {
  const colorStyles = {
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  };

  const trendStyles = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className={`${colorStyles[color]} border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <p className={`text-sm font-medium ${trendStyles[trend.type]} mt-2`}>
              {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full ${colorStyles[color]} bg-opacity-40 flex items-center justify-center`}>
              <Icon size={32} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(StatWidget);
