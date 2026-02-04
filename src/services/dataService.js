import { supabase } from './supabaseClient';

// ============ LAPORAN PENGADUAN (Kasus) ============

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

  // Create kasus baru (dari form lapor publik)
  async createKasus(kasusData) {
    try {
      // Generate kode tiket
      const kodeTiket = `TIKET-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .insert([{
          kode_tiket: kodeTiket,
          kategori_id: kasusData.kategori_id,
          kronologi: kasusData.kronologi,
          lokasi_kejadian: kasusData.lokasi_kejadian,
          bukti_foto_url: kasusData.bukti_foto_url || null,
          is_anonim: kasusData.is_anonim || true,
          nama_pelapor: kasusData.is_anonim ? 'Hamba Allah' : kasusData.nama_pelapor,
          kontak_pelapor: kasusData.kontak_pelapor,
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, kodeTiket };
    } catch (err) {
      console.error('Error creating kasus:', err);
      return { success: false, error: err.message };
    }
  },

  // Update status & rujukan kasus (hanya admin)
  async updateKasus(id, updates) {
    try {
      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .update({
          status: updates.status,
          instansi_rujukan: updates.instansi_rujukan || null,
          catatan_admin: updates.catatan_admin,
          updated_at: new Date().toISOString(),
        })
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

  // Fetch kasus by kode tiket (untuk cek status publik)
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

// ============ AGENDA KEGIATAN ============

export const agendaService = {
  // Fetch semua agenda (publik)
  async getAllAgenda() {
    try {
      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .select('*')
        .order('tanggal_pelaksanaan', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching all agenda:', err);
      return { success: false, error: err.message };
    }
  },

  // Fetch agenda by desa (untuk Satgas)
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
      console.error('Error fetching agenda by desa:', err);
      return { success: false, error: err.message };
    }
  },

  // Fetch single agenda by ID
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
      console.error('Error fetching agenda by ID:', err);
      return { success: false, error: err.message };
    }
  },

  // Create agenda baru
  async createAgenda(agendaData) {
    try {
      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .insert([agendaData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error creating agenda:', err);
      return { success: false, error: err.message };
    }
  },

  // Update agenda
  async updateAgenda(id, updates) {
    try {
      const { data, error } = await supabase
        .from('agenda_kegiatan')
        .update(updates)
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

  // Delete agenda
  async deleteAgenda(id) {
    try {
      const { error } = await supabase
        .from('agenda_kegiatan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error deleting agenda:', err);
      return { success: false, error: err.message };
    }
  },
};

// ============ KONTEN EDUKASI ============

export const edukasiService = {
  // Fetch semua artikel (publik)
  async getAllEdukasi() {
    try {
      const { data, error } = await supabase
        .from('konten_edukasi')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching all edukasi:', err);
      return { success: false, error: err.message };
    }
  },

  // Fetch single artikel by ID
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
      console.error('Error fetching edukasi by ID:', err);
      return { success: false, error: err.message };
    }
  },

  // Create artikel baru (Kecamatan only)
  async createEdukasi(edukasiData) {
    try {
      const { data, error } = await supabase
        .from('konten_edukasi')
        .insert([edukasiData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error creating edukasi:', err);
      return { success: false, error: err.message };
    }
  },

  // Update artikel
  async updateEdukasi(id, updates) {
    try {
      const { data, error } = await supabase
        .from('konten_edukasi')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error updating edukasi:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete artikel
  async deleteEdukasi(id) {
    try {
      const { error } = await supabase
        .from('konten_edukasi')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error deleting edukasi:', err);
      return { success: false, error: err.message };
    }
  },
};

// ============ MASTER DATA ============

export const masterService = {
  // Fetch semua kategori kasus
  async getKategoriKasus() {
    try {
      const { data, error } = await supabase
        .from('m_kategori_kasus')
        .select('*')
        .order('kelompok', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching kategori kasus:', err);
      return { success: false, error: err.message };
    }
  },

  // Fetch kategori by kelompok (Perempuan/Anak)
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
      console.error('Error fetching kategori by kelompok:', err);
      return { success: false, error: err.message };
    }
  },
};

// ============ PENGATURAN WEB ============

export const settingsService = {
  // Fetch pengaturan web
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('pengaturan_web')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching settings:', err);
      return { success: false, error: err.message };
    }
  },

  // Update pengaturan web
  async updateSettings(updates) {
    try {
      const { data, error } = await supabase
        .from('pengaturan_web')
        .upsert(updates)
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
