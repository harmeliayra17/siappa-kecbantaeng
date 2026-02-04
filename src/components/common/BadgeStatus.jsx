import React, { memo } from 'react';

/**
 * Badge Status Component - Display status dengan warna berbeda
 * @param {string} status - Status value
 * @param {object} statusConfig - Custom status configuration
 */
function BadgeStatus({ status, statusConfig }) {
  const defaultConfig = {
    'Menunggu Verifikasi': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Verifikasi' },
    'Sedang Ditangani': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sedang Ditangani' },
    'Sedang Dirujuk': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Sedang Dirujuk' },
    'Selesai': { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
    'Ditolak': { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
    'Aktif': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
    'Tidak Aktif': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Tidak Aktif' },
  };

  const config = {
    ...defaultConfig,
    ...(statusConfig || {}),
  };

  const statusInfo = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
      {statusInfo.label}
    </span>
  );
}

export default memo(BadgeStatus);
