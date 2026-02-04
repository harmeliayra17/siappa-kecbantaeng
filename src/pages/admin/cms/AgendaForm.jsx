import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { agendaService, masterService } from '../../../services/dataService';
import ImageUpload from '../../../components/common/ImageUpload';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function AgendaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!id);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [kategoris, setKategoris] = useState([]);

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

  useEffect(() => {
    fetchKategoris();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      fetchAgendaData();
    }
  }, [id, isEditMode]);

  const fetchAgendaData = async () => {
    try {
      setLoading(true);
      const result = await agendaService.getAgendaById(id);
      if (result?.success && result.data) {
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
      }
    } catch (err) {
      console.error('Error fetching agenda:', err);
      alert('Gagal memuat data kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const fetchKategoris = async () => {
    try {
      const result = await masterService.getKategoriKasus();
      if (result?.success) {
        setKategoris(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching kategoris:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.judul_kegiatan.trim()) newErrors.judul_kegiatan = 'Judul kegiatan wajib diisi';
    if (!formData.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi';
    if (!formData.tanggal_pelaksanaan) newErrors.tanggal_pelaksanaan = 'Tanggal pelaksanaan wajib diisi';
    if (!formData.waktu) newErrors.waktu = 'Waktu wajib diisi';
    if (!formData.lokasi.trim()) newErrors.lokasi = 'Lokasi wajib diisi';
    if (!formData.jenis_agenda.trim()) newErrors.jenis_agenda = 'Jenis agenda wajib diisi';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError('Mohon isi semua field yang wajib');
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      let result;
      
      if (isEditMode) {
        result = await agendaService.updateAgenda(id, formData);
        if (result?.success) {
          alert('Kegiatan berhasil diperbarui');
          navigate('/admin/cms/agenda');
        } else {
          setSubmitError(result?.error || 'Gagal memperbarui kegiatan');
        }
      } else {
        result = await agendaService.createAgenda(formData);
        if (result?.success) {
          alert('Kegiatan berhasil ditambahkan');
          navigate('/admin/cms/agenda');
        } else {
          setSubmitError(result?.error || 'Gagal menambahkan kegiatan');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/cms/agenda')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <p>{submitError}</p>
            </div>
          )}
          {/* Judul */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Judul Kegiatan <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="judul_kegiatan"
              value={formData.judul_kegiatan}
              onChange={handleInputChange}
              placeholder="Masukkan judul kegiatan"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.judul_kegiatan ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.judul_kegiatan && <p className="text-red-600 text-sm mt-1">{errors.judul_kegiatan}</p>}
          </div>

          {/* Jenis Agenda */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jenis Agenda <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="jenis_agenda"
              value={formData.jenis_agenda}
              onChange={handleInputChange}
              placeholder="Contoh: Workshop, Seminar, Kampanye, dll"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.jenis_agenda ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.jenis_agenda && <p className="text-red-600 text-sm mt-1">{errors.jenis_agenda}</p>}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi <span className="text-red-600">*</span>
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              placeholder="Jelaskan kegiatan ini..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.deskripsi ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.deskripsi && <p className="text-red-600 text-sm mt-1">{errors.deskripsi}</p>}
          </div>

          {/* Poster/Gambar */}
          <ImageUpload
            value={formData.poster_url}
            onChange={(url, path) => {
              setFormData(prev => ({
                ...prev,
                poster_url: url,
              }));
            }}
            uploadType="agenda"
            label="Poster Kegiatan"
          />

          {/* Tanggal Pelaksanaan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Pelaksanaan <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="tanggal_pelaksanaan"
              value={formData.tanggal_pelaksanaan}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.tanggal_pelaksanaan ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.tanggal_pelaksanaan && <p className="text-red-600 text-sm mt-1">{errors.tanggal_pelaksanaan}</p>}
          </div>

          {/* Waktu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Waktu Pelaksanaan <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              name="waktu"
              value={formData.waktu}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.waktu ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.waktu && <p className="text-red-600 text-sm mt-1">{errors.waktu}</p>}
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lokasi <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleInputChange}
              placeholder="Masukkan lokasi kegiatan"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.lokasi ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lokasi && <p className="text-red-600 text-sm mt-1">{errors.lokasi}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/cms/agenda')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? (isEditMode ? 'Memperbarui...' : 'Menyimpan...') : (isEditMode ? 'Perbarui' : 'Simpan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
