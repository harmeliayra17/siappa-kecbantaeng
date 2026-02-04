import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';

/**
 * ImageUpload Component - Reusable image upload dengan preview
 * Props:
 *  - value: current image URL
 *  - onChange: callback (url, path)
 *  - onDelete: callback untuk delete image
 *  - uploadType: 'agenda', 'edukasi', 'website'
 *  - label: label untuk input
 *  - required: boolean
 */
export default function ImageUpload({
  value,
  onChange,
  onDelete,
  uploadType = 'website',
  label = 'Upload Gambar',
  required = false,
  maxWidth = 400,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');

      // Determine upload function based on type
      let uploadFunc;
      if (uploadType === 'agenda') {
        uploadFunc = storageService.uploadAgendaImage;
      } else if (uploadType === 'edukasi') {
        uploadFunc = storageService.uploadEdukasiImage;
      } else {
        uploadFunc = storageService.uploadWebsiteImage;
      }

      const result = await uploadFunc(file);

      if (result.success) {
        setPreviewUrl(result.url);
        onChange(result.url, result.path);
        setError('');
      } else {
        setError(result.error || 'Gagal upload gambar');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat upload');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      setLoading(true);
      // Extract path from URL jika perlu
      // atau coba delete dengan direct path
      // Untuk sekarang, cukup clear preview
      setPreviewUrl('');
      onChange('', '');
      onDelete?.();
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Gagal menghapus gambar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      {/* Preview */}
      {previewUrl && (
        <div className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-48 mx-auto rounded"
            onError={() => setPreviewUrl('')}
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            loading
              ? 'border-gray-300 bg-gray-50'
              : 'border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />

          <Upload className={`mx-auto mb-2 ${loading ? 'text-gray-400' : 'text-primary'}`} size={24} />
          <p className={`text-sm font-medium ${loading ? 'text-gray-500' : 'text-gray-700'}`}>
            {loading ? 'Uploading...' : 'Klik atau drag gambar ke sini'}
          </p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
