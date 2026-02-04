import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { agendaService } from '../../../services/dataService';
import ImageUpload from '../../../components/common/ImageUpload';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function AgendaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  
  // State Utama
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});

  // State Form (Sesuai kolom Database: agenda_kegiatan)
  const [formData, setFormData] = useState({
    judul_kegiatan: '',
    jenis_agenda: '',
    tanggal_pelaksanaan: '',
    waktu: '',
    lokasi: '',
    deskripsi: '',
    poster_url: '',
    desa_pemilik: profile?.desa_tugas || '',
  });

  // Pilihan Jenis Agenda (Hardcoded agar rapi)
  const jenisAgendaOptions = [
    "Sosialisasi", 
    "Pelatihan/Workshop", 
    "Rapat Koordinasi", 
    "Posyandu", 
    "Kampanye",
    "Lainnya"
  ];

  // 1. Cek Mode Edit & Fetch Data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchAgendaData(id);
    }
  }, [id]);

  // 2. Fungsi Ambil Data Lama (Khusus Edit)
  const fetchAgendaData = async (agendaId) => {
    try {
      setLoading(true);
      const result = await agendaService.getAgendaById(agendaId);
      
      if (result?.success && result.data) {
        // Mapping data dari DB ke State Form
        setFormData({
          judul_kegiatan: result.data.judul_kegiatan || '',
          jenis_agenda: result.data.jenis_agenda || '',
          tanggal_pelaksanaan: result.data.tanggal_pelaksanaan || '',
          waktu: result.data.waktu || '',
          lokasi: result.data.lokasi || '',
          deskripsi: result.data.deskripsi || '',
          poster_url: result.data.poster_url || '',
          desa_pemilik: result.data.desa_pemilik || profile?.desa_tugas || '',
        });
      } else {
        alert("Data kegiatan tidak ditemukan.");
        navigate('/admin/cms/agenda');
      }
    } catch (err) {
      console.error('Error fetching agenda:', err);
      setSubmitError('Gagal memuat data kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Input Perubahan
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Hapus error realtime
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 4. Validasi Form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.judul_kegiatan.trim()) newErrors.judul_kegiatan = 'Judul wajib diisi';
    if (!formData.jenis_agenda) newErrors.jenis_agenda = 'Jenis agenda wajib dipilih';
    if (!formData.tanggal_pelaksanaan) newErrors.tanggal_pelaksanaan = 'Tanggal wajib diisi';
    if (!formData.waktu) newErrors.waktu = 'Waktu wajib diisi';
    if (!formData.lokasi.trim()) newErrors.lokasi = 'Lokasi wajib diisi';
    if (!formData.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi';

    return newErrors;
  };

  // 5. Handle Submit (Simpan / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError('Mohon lengkapi semua field yang wajib.');
      window.scrollTo(0,0);
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      let result;
      
      // Payload data yang akan dikirim (Mapping eksplisit biar aman)
      const payload = {
        judul_kegiatan: formData.judul_kegiatan,
        jenis_agenda: formData.jenis_agenda,
        tanggal_pelaksanaan: formData.tanggal_pelaksanaan,
        waktu: formData.waktu,
        lokasi: formData.lokasi,
        deskripsi: formData.deskripsi,
        poster_url: formData.poster_url, // URL gambar (baru atau lama)
        desa_pemilik: formData.desa_pemilik
      };

      if (isEditMode) {
        // UPDATE
        result = await agendaService.updateAgenda(id, payload);
      } else {
        // CREATE
        result = await agendaService.createAgenda(payload);
      }

      if (result?.success) {
        alert(isEditMode ? 'Kegiatan berhasil diperbarui!' : 'Kegiatan berhasil ditambahkan!');
        navigate('/admin/cms/agenda');
      } else {
        setSubmitError(result?.error || 'Gagal menyimpan data.');
      }
    } catch (err) {
      console.error('Error:', err);
      setSubmitError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 pt-6">
        <button
          onClick={() => navigate('/admin/cms/agenda')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error Alert */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <p>{submitError}</p>
            </div>
          )}

          {/* Upload Poster */}
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Poster Kegiatan</label>
             <div className="bg-gray-50 p-1 rounded-lg">
                <ImageUpload
                    value={formData.poster_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, poster_url: url }))}
                    uploadType="agenda"
                    label="Klik atau seret poster ke sini"
                    maxWidth={600}
                />
             </div>
             <p className="text-xs text-gray-500 mt-2">Format: JPG/PNG. Max 5MB.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Judul */}
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                Judul Kegiatan <span className="text-red-600">*</span>
                </label>
                <input
                type="text"
                name="judul_kegiatan"
                value={formData.judul_kegiatan}
                onChange={handleInputChange}
                placeholder="Contoh: Sosialisasi Pencegahan Stunting"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.judul_kegiatan ? 'border-red-500' : 'border-gray-300'
                }`}
                />
                {errors.judul_kegiatan && <p className="text-red-600 text-xs mt-1">{errors.judul_kegiatan}</p>}
            </div>

            {/* Jenis Agenda */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                Jenis Agenda <span className="text-red-600">*</span>
                </label>
                <select
                name="jenis_agenda"
                value={formData.jenis_agenda}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white ${
                    errors.jenis_agenda ? 'border-red-500' : 'border-gray-300'
                }`}
                >
                <option value="">-- Pilih Jenis --</option>
                {jenisAgendaOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>
                {errors.jenis_agenda && <p className="text-red-600 text-xs mt-1">{errors.jenis_agenda}</p>}
            </div>

            {/* Lokasi */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                Lokasi <span className="text-red-600">*</span>
                </label>
                <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleInputChange}
                placeholder="Contoh: Balai Desa Bantaeng"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.lokasi ? 'border-red-500' : 'border-gray-300'
                }`}
                />
                {errors.lokasi && <p className="text-red-600 text-xs mt-1">{errors.lokasi}</p>}
            </div>

            {/* Tanggal */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                Tanggal Pelaksanaan <span className="text-red-600">*</span>
                </label>
                <input
                type="date"
                name="tanggal_pelaksanaan"
                value={formData.tanggal_pelaksanaan}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.tanggal_pelaksanaan ? 'border-red-500' : 'border-gray-300'
                }`}
                />
                {errors.tanggal_pelaksanaan && <p className="text-red-600 text-xs mt-1">{errors.tanggal_pelaksanaan}</p>}
            </div>

            {/* Waktu */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                Waktu (WITA) <span className="text-red-600">*</span>
                </label>
                <input
                type="time"
                name="waktu"
                value={formData.waktu}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.waktu ? 'border-red-500' : 'border-gray-300'
                }`}
                />
                {errors.waktu && <p className="text-red-600 text-xs mt-1">{errors.waktu}</p>}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Deskripsi Lengkap <span className="text-red-600">*</span>
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              placeholder="Jelaskan detail kegiatan, peserta yang diundang, dan tujuan kegiatan..."
              rows={5}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.deskripsi ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.deskripsi && <p className="text-red-600 text-xs mt-1">{errors.deskripsi}</p>}
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/cms/agenda')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-70 shadow-sm"
            >
              <Save size={20} />
              {loading ? (isEditMode ? 'Menyimpan...' : 'Menyimpan...') : (isEditMode ? 'Simpan Perubahan' : 'Buat Kegiatan')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}