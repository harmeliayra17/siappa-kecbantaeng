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
    deskripsi_kegiatan: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi_kegiatan: '',
    kategori_kegiatan: '',
    desa_pemilik: profile?.desa_tugas || '',
    status: 'Akan Datang',
    gambar_thumbnail: '',
    gambar_path: '',
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
          deskripsi_kegiatan: result.data.deskripsi_kegiatan || '',
          tanggal_mulai: result.data.tanggal_mulai || '',
          tanggal_selesai: result.data.tanggal_selesai || '',
          waktu_mulai: result.data.waktu_mulai || '',
          waktu_selesai: result.data.waktu_selesai || '',
          lokasi_kegiatan: result.data.lokasi_kegiatan || '',
          kategori_kegiatan: result.data.kategori_kegiatan || '',
          desa_pemilik: result.data.desa_pemilik || profile?.desa_tugas || '',
          status: result.data.status || 'Akan Datang',
          gambar_thumbnail: result.data.gambar_thumbnail || '',
          gambar_path: result.data.gambar_path || '',
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
    if (!formData.deskripsi_kegiatan.trim()) newErrors.deskripsi_kegiatan = 'Deskripsi wajib diisi';
    if (!formData.tanggal_mulai) newErrors.tanggal_mulai = 'Tanggal mulai wajib diisi';
    if (!formData.tanggal_selesai) newErrors.tanggal_selesai = 'Tanggal selesai wajib diisi';
    if (!formData.lokasi_kegiatan.trim()) newErrors.lokasi_kegiatan = 'Lokasi wajib diisi';
    if (!formData.kategori_kegiatan) newErrors.kategori_kegiatan = 'Kategori wajib dipilih';

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

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deskripsi <span className="text-red-600">*</span>
            </label>
            <textarea
              name="deskripsi_kegiatan"
              value={formData.deskripsi_kegiatan}
              onChange={handleInputChange}
              placeholder="Jelaskan kegiatan ini..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.deskripsi_kegiatan ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.deskripsi_kegiatan && <p className="text-red-600 text-sm mt-1">{errors.deskripsi_kegiatan}</p>}
          </div>

          {/* Gambar Thumbnail */}
          <ImageUpload
            value={formData.gambar_thumbnail}
            onChange={(url, path) => {
              setFormData(prev => ({
                ...prev,
                gambar_thumbnail: url,
                gambar_path: path,
              }));
            }}
            uploadType="agenda"
            label="Gambar Kegiatan"
          />

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori <span className="text-red-600">*</span>
            </label>
            <select
              name="kategori_kegiatan"
              value={formData.kategori_kegiatan}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.kategori_kegiatan ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Pilih Kategori</option>
              {kategoris.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kategori}</option>
              ))}
            </select>
            {errors.kategori_kegiatan && <p className="text-red-600 text-sm mt-1">{errors.kategori_kegiatan}</p>}
          </div>

          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Mulai <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                value={formData.tanggal_mulai}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.tanggal_mulai ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tanggal_mulai && <p className="text-red-600 text-sm mt-1">{errors.tanggal_mulai}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Selesai <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.tanggal_selesai ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tanggal_selesai && <p className="text-red-600 text-sm mt-1">{errors.tanggal_selesai}</p>}
            </div>
          </div>

          {/* Waktu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu Mulai</label>
              <input
                type="time"
                name="waktu_mulai"
                value={formData.waktu_mulai}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu Selesai</label>
              <input
                type="time"
                name="waktu_selesai"
                value={formData.waktu_selesai}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lokasi <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="lokasi_kegiatan"
              value={formData.lokasi_kegiatan}
              onChange={handleInputChange}
              placeholder="Masukkan lokasi kegiatan"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.lokasi_kegiatan ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lokasi_kegiatan && <p className="text-red-600 text-sm mt-1">{errors.lokasi_kegiatan}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Akan Datang">Akan Datang</option>
              <option value="Sedang Berlangsung">Sedang Berlangsung</option>
              <option value="Selesai">Selesai</option>
            </select>
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
