/**
 * Format Tanggal Utility
 * Mengubah format tanggal dari ISO (2026-01-31) ke format Indonesia (31 Januari 2026)
 */

const bulanIndonesia = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} tanggal - Tanggal input (ISO string atau Date object)
 * @param {string} format - Format output: 'long' (31 Januari 2026), 'short' (31/01/2026)
 * @returns {string} Tanggal terformat
 */
export function formatTanggal(tanggal, format = 'long') {
  if (!tanggal) return '-';

  const date = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  
  if (isNaN(date.getTime())) return '-';

  const hari = date.getDate();
  const bulan = date.getMonth();
  const tahun = date.getFullYear();

  if (format === 'short') {
    return `${String(hari).padStart(2, '0')}/${String(bulan + 1).padStart(2, '0')}/${tahun}`;
  }

  return `${hari} ${bulanIndonesia[bulan]} ${tahun}`;
}

/**
 * Format tanggal dan waktu
 * @param {string|Date} tanggal - Tanggal input
 * @returns {string} Contoh: "31 Januari 2026 - 14:30"
 */
export function formatTanggalJam(tanggal) {
  if (!tanggal) return '-';

  const date = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  
  if (isNaN(date.getTime())) return '-';

  const hari = date.getDate();
  const bulan = date.getMonth();
  const tahun = date.getFullYear();
  const jam = String(date.getHours()).padStart(2, '0');
  const menit = String(date.getMinutes()).padStart(2, '0');

  return `${hari} ${bulanIndonesia[bulan]} ${tahun} - ${jam}:${menit}`;
}

/**
 * Hitung perbedaan tanggal
 * @param {Date} tanggal1 - Tanggal awal
 * @param {Date} tanggal2 - Tanggal akhir
 * @returns {number} Selisih dalam hari
 */
export function selisihTanggal(tanggal1, tanggal2) {
  const date1 = new Date(tanggal1);
  const date2 = new Date(tanggal2);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format durasi (untuk menampilkan "2 hari lalu", "3 jam lalu", etc)
 * @param {string|Date} tanggal - Tanggal yang ingin dibandingkan dengan sekarang
 * @returns {string} Contoh: "2 hari lalu"
 */
export function formatDurasiLalu(tanggal) {
  if (!tanggal) return '-';

  const date = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  const sekarang = new Date();
  const diffMs = sekarang - date;
  const diffMenit = Math.floor(diffMs / (1000 * 60));
  const diffJam = Math.floor(diffMs / (1000 * 60 * 60));
  const diffHari = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMenit < 1) return 'Baru saja';
  if (diffMenit < 60) return `${diffMenit} menit lalu`;
  if (diffJam < 24) return `${diffJam} jam lalu`;
  if (diffHari < 30) return `${diffHari} hari lalu`;

  return formatTanggal(tanggal);
}

/**
 * Parse ISO string dan return object {tanggal, waktu}
 * @param {string} isoString - ISO datetime string
 * @returns {object} {tanggal: "31 Januari 2026", waktu: "14:30"}
 */
export function parseISO(isoString) {
  if (!isoString) return { tanggal: '-', waktu: '-' };

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return { tanggal: '-', waktu: '-' };

  const jam = String(date.getHours()).padStart(2, '0');
  const menit = String(date.getMinutes()).padStart(2, '0');

  return {
    tanggal: formatTanggal(date),
    waktu: `${jam}:${menit}`,
  };
}
