import { supabase } from './supabaseClient';

// ==========================================
// 1. SERVICE KASUS (LAPORAN PENGADUAN)
// ==========================================
export const kasusService = {
  // Fetch semua kasus (untuk Kecamatan Admin)
  async getAllKasus() {
    try {
      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .select(`
          *,
          kategori:m_kategori_kasus(id, kelompok, nama_kategori)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching all kasus:', err);
      return { success: false, error: err.message };
    }
  },

  // Fetch kasus by desa (untuk Satgas Admin)
  async getKasusByDesa(desa) {
    try {
      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .select(`
          *,
          kategori:m_kategori_kasus(id, kelompok, nama_kategori)
        `)
        .eq('lokasi_kejadian', desa)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching kasus by desa:', err);
      return { success: false, error: err.message };
    }
  },

  // Fetch single kasus by ID
  async getKasusById(id) {
    try {
      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .select(`
          *,
          kategori:m_kategori_kasus(id, kelompok, nama_kategori)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching kasus by ID:', err);
      return { success: false, error: err.message };
    }
  },

  // Create kasus baru (Form Lapor)
  async createKasus(kasusData) {
    try {
      const kodeTiket = `TIKET-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Mapping data agar sesuai kolom DB
      const payload = {
        kode_tiket: kodeTiket,
        kategori_id: kasusData.kategori_id,
        kronologi: kasusData.kronologi,
        lokasi_kejadian: kasusData.lokasi_kejadian,
        bukti_foto: kasusData.bukti_foto || null,
        is_anonim: kasusData.is_anonim || true,
        nama_pelapor: kasusData.is_anonim ? 'Hamba Allah' : kasusData.nama_pelapor,
        kontak_pelapor: kasusData.kontak_pelapor,
        status_pelapor: kasusData.status_pelapor,
        usia: kasusData.usia ? parseInt(kasusData.usia) : null,
        hubungan_korban: kasusData.hubungan_korban,
        tanggal_kejadian: kasusData.tanggal_kejadian || new Date().toISOString().split('T')[0],
        status_kasus: 'Pending'
      };

      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, kodeTiket };
    } catch (err) {
      console.error('Error creating kasus:', err);
      return { success: false, error: err.message };
    }
  },

  // Update status & rujukan (Admin)
  async updateKasus(id, updates) {
    try {
      // Mapping update agar sesuai kolom DB
      const payload = {
        status_kasus: updates.status_kasus, // Pastikan ini status_kasus, bukan status
        instansi_rujukan: updates.instansi_rujukan || null,
        catatan_admin: updates.catatan_admin,
        updated_at: new Date().toISOString(),
      };

      // Jika status selesai, isi tanggal_selesai
      if (updates.status_kasus === 'Selesai') {
        payload.tanggal_selesai = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error updating kasus:', err);
      return { success: false, error: err.message };
    }
  },

  // Cek Status (Masyarakat)
  async getKasusByKodeTiket(kodeTiket) {
    try {
      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .select(`
          *,
          kategori:m_kategori_kasus(id, kelompok, nama_kategori)
        `)
        .eq('kode_tiket', kodeTiket)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching kasus by kode tiket:', err);
      return { success: false, error: err.message };
    }
  },
};

// ==========================================
// 2. SERVICE AGENDA KEGIATAN
// ==========================================
export const agendaService = {
  async getAllAgenda() {
    try {
      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .select('*')
        .order('tanggal_pelaksanaan', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getAgendaByDesa(desa) {
    try {
      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .select('*')
        .eq('desa_pemilik', desa)
        .order('tanggal_pelaksanaan', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getAgendaById(id) {
    try {
      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async createAgenda(formData) {
    try {
      const payload = {
        judul_kegiatan: formData.judul_kegiatan,
        jenis_agenda: formData.jenis_agenda,
        tanggal_pelaksanaan: formData.tanggal_pelaksanaan,
        waktu: formData.waktu,
        lokasi: formData.lokasi,
        deskripsi: formData.deskripsi,
        poster_url: formData.poster_url,
        desa_pemilik: formData.desa_pemilik
      };

      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error creating agenda:', err);
      return { success: false, error: err.message };
    }
  },

  async updateAgenda(id, formData) {
    try {
      const payload = {
        judul_kegiatan: formData.judul_kegiatan,
        jenis_agenda: formData.jenis_agenda,
        tanggal_pelaksanaan: formData.tanggal_pelaksanaan,
        waktu: formData.waktu,
        lokasi: formData.lokasi,
        deskripsi: formData.deskripsi,
        poster_url: formData.poster_url,
        desa_pemilik: formData.desa_pemilik
      };

      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error updating agenda:', err);
      return { success: false, error: err.message };
    }
  },

  async deleteAgenda(id) {
    try {
      const { error } = await supabase
        .from('agenda_kegiatan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};

// ==========================================
// 3. SERVICE KONTEN EDUKASI
// ==========================================
export const edukasiService = {
  async getAllEdukasi() {
    try {
      const { data, error } = await supabase
        .from('konten_edukasi')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getEdukasiById(id) {
    try {
      const { data, error } = await supabase
        .from('konten_edukasi')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async createEdukasi(formData) {
    try {
      const payload = {
        judul_artikel: formData.judul_artikel,
        isi_konten: formData.isi_konten,
        kategori: formData.kategori,
        gambar_thumbnail: formData.gambar_thumbnail,
      };

      const { data, error } = await supabase
        .from('konten_edukasi')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateEdukasi(id, formData) {
    try {
      const payload = {
        judul_artikel: formData.judul_artikel,
        isi_konten: formData.isi_konten,
        kategori: formData.kategori,
        gambar_thumbnail: formData.gambar_thumbnail,
      };

      const { data, error } = await supabase
        .from('konten_edukasi')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteEdukasi(id) {
    try {
      const { error } = await supabase
        .from('konten_edukasi')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};

// ==========================================
// 4. SERVICE MASTER DATA (KATEGORI)
// ==========================================
export const masterService = {
  async getKategoriKasus() {
    try {
      const { data, error } = await supabase
        .from('m_kategori_kasus')
        .select('*')
        .order('kelompok', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getKategoriByKelompok(kelompok) {
    try {
      const { data, error } = await supabase
        .from('m_kategori_kasus')
        .select('*')
        .eq('kelompok', kelompok)
        .order('nama_kategori', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};

// ==========================================
// 5. SERVICE PENGATURAN WEB
// ==========================================
export const settingsService = {
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('pengaturan_web')
        .select('*')
        .limit(1)
        .single();

      // Kode error PGRST116 berarti data kosong (belum diisi), kita anggap sukses tp kosong
      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateSettings(updates) {
    try {
      const { data, error } = await supabase
        .from('pengaturan_web')
        .upsert(updates) // Upsert: Kalau ada diupdate, kalau belum ada dibuat baru
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error updating settings:', err);
      return { success: false, error: err.message };
    }
  },
};