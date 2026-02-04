import { supabase } from './supabaseClient';

/**
 * Storage Service untuk handle image uploads ke Supabase Storage
 */
export const storageService = {
  // Upload image ke bucket spesifik
  async uploadImage(file, bucketName, folder) {
    try {
      if (!file) {
        throw new Error('File tidak ditemukan');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Ukuran file terlalu besar. Maksimal 5MB');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const filename = `${timestamp}-${random}-${file.name}`;
      const filepath = folder ? `${folder}/${filename}` : filename;

      console.log('Uploading file:', { filename, folder, size: file.size, type: file.type });

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filepath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(error.message || 'Gagal upload ke server');
      }

      console.log('Upload successful, getting public URL...');

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filepath);

      if (!publicData?.publicUrl) {
        throw new Error('Gagal mendapatkan URL publik');
      }

      console.log('Upload complete:', publicData.publicUrl);

      return {
        success: true,
        url: publicData.publicUrl,
        path: filepath,
        filename: filename,
      };
    } catch (err) {
      console.error('Error uploading image:', err);
      return {
        success: false,
        error: err.message || 'Gagal upload gambar',
      };
    }
  },

  // Delete image dari bucket
  async deleteImage(filepath, bucketName) {
    try {
      if (!filepath) {
        throw new Error('Filepath tidak ditemukan');
      }

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filepath]);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      console.error('Error deleting image:', err);
      return { success: false, error: err.message };
    }
  },

  // Upload untuk Agenda dengan thumbnail
  async uploadAgendaImage(file) {
    return this.uploadImage(file, 'si-appa-content', 'agenda');
  },

  // Upload untuk Edukasi dengan featured image
  async uploadEdukasiImage(file) {
    return this.uploadImage(file, 'si-appa-content', 'edukasi');
  },

  // Upload untuk Home/Profil content
  async uploadWebsiteImage(file) {
    return this.uploadImage(file, 'si-appa-content', 'website');
  },

  // Upload untuk Laporan Pengaduan bukti foto
  async uploadLaporanImage(file) {
    return this.uploadImage(file, 'si-appa-content', 'laporan');
  },
};
