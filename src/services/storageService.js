import { supabase } from './supabaseClient';

// ==========================================
// 1. FUNGSI INTI (Core Logic) - Ditaruh diluar objek biar aman
//    Fungsi ini berdiri sendiri, tidak butuh 'this'.
// ==========================================

const coreUploadImage = async (file, bucketName, folder) => {
  try {
    if (!file) throw new Error('File tidak ditemukan');

    // 1. Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF');
    }

    // 2. Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file terlalu besar. Maksimal 5MB');
    }

    // 3. Generate Clean Filename (Biar gak error kalau ada spasi/karakter aneh)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // Hapus karakter aneh
    const filename = `${timestamp}-${random}-${cleanName}`;
    const filepath = folder ? `${folder}/${filename}` : filename;

    console.log('Uploading...', { bucketName, filepath });

    // 4. Upload ke Supabase
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 5. Ambil Public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filepath);

    if (!publicData?.publicUrl) {
      throw new Error('Gagal mendapatkan URL publik');
    }

    console.log('Upload Success:', publicData.publicUrl);

    return {
      success: true,
      url: publicData.publicUrl,
      path: filepath,
    };

  } catch (err) {
    console.error('Core upload error:', err);
    return {
      success: false,
      error: err.message || 'Gagal upload gambar',
    };
  }
};

const coreDeleteImage = async (filepath, bucketName) => {
  try {
    if (!filepath) throw new Error('Filepath kosong');
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filepath]);
    
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Delete error:', err);
    return { success: false, error: err.message };
  }
};

// ==========================================
// 2. EXPORT SERVICE (Wrapper)
//    Di sini kita panggil fungsi inti tadi secara langsung.
//    Tidak ada lagi kata kunci 'this'.
// ==========================================

export const storageService = {
  // Fungsi umum (bisa dipanggil manual jika perlu)
  uploadImage: (file, bucket, folder) => coreUploadImage(file, bucket, folder),
  deleteImage: (path, bucket) => coreDeleteImage(path, bucket),

  // === FUNGSI SPESIFIK (Agenda, Edukasi, dll) ===
  // Perhatikan: Tidak pakai 'this.uploadImage', tapi langsung 'coreUploadImage'
  
  uploadAgendaImage: async (file) => {
    return coreUploadImage(file, 'si-appa-content', 'agenda');
  },

  uploadEdukasiImage: async (file) => {
    return coreUploadImage(file, 'si-appa-content', 'edukasi');
  },

  uploadWebsiteImage: async (file) => {
    return coreUploadImage(file, 'si-appa-content', 'website');
  },

  uploadLaporanImage: async (file) => {
    return coreUploadImage(file, 'si-appa-content', 'laporan');
  },
};