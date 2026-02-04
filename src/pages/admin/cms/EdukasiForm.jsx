import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { edukasiService, masterService } from '../../../services/dataService';
import ImageUpload from '../../../components/common/ImageUpload';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function EdukasiForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!id);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [kategoris, setKategoris] = useState([]);

  const [formData, setFormData] = useState({
    judul_artikel: '',
    isi_konten: '',
    kategori: '',
    gambar_thumbnail: '',
  });

  useEffect(() => {
    fetchKategoris();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      fetchEdukasiData();
    }
  }, [id, isEditMode]);

  const fetchEdukasiData = async () => {
    try {
      setLoading(true);
      const result = await edukasiService.getEdukasiById(id);
      if (result?.success && result.data) {
        setFormData({
          judul_artikel: result.data.judul_artikel || '',
          isi_konten: result.data.isi_konten || '',
          kategori: result.data.kategori || '',
          gambar_thumbnail: result.data.gambar_thumbnail || '',
        });
      }
    } catch (err) {
      console.error('Error fetching edukasi:', err);
      alert('Gagal memuat data konten');
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
    if (!formData.judul_artikel.trim()) newErrors.judul_artikel = 'Judul wajib diisi';
    if (!formData.isi_konten.trim()) newErrors.isi_konten = 'Isi konten wajib diisi';
    if (!formData.kategori.trim()) newErrors.kategori = 'Kategori wajib diisi';

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
        result = await edukasiService.updateEdukasi(id, formData);
        if (result?.success) {
          alert('Konten edukasi berhasil diperbarui');
          navigate('/admin/cms/edukasi');
        } else {
          setSubmitError(result?.error || 'Gagal memperbarui konten edukasi');
        }
      } else {
        result = await edukasiService.createEdukasi(formData);
        if (result?.success) {
          alert('Konten edukasi berhasil ditambahkan');
          navigate('/admin/cms/edukasi');
        } else {
          setSubmitError(result?.error || 'Gagal menambahkan konten edukasi');
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
          onClick={() => navigate('/admin/cms/edukasi')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Konten Edukasi' : 'Tambah Konten Edukasi'}
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
          {/* Gambar Thumbnail */}
          <ImageUpload
            value={formData.gambar_thumbnail}
            onChange={(url, path) => {
              setFormData(prev => ({
                ...prev,
                gambar_thumbnail: url,
              }));
            }}
            uploadType="edukasi"
            label="Gambar Artikel"
          />

          {/* Judul */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Judul Artikel <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="judul_artikel"
              value={formData.judul_artikel}
              onChange={handleInputChange}
              placeholder="Masukkan judul artikel"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.judul_artikel ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.judul_artikel && <p className="text-red-600 text-sm mt-1">{errors.judul_artikel}</p>}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="kategori"
              value={formData.kategori}
              onChange={handleInputChange}
              placeholder="Contoh: Kesehatan, Pendidikan, Hukum, dll"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.kategori ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.kategori && <p className="text-red-600 text-sm mt-1">{errors.kategori}</p>}
          </div>

          {/* Isi Konten */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Isi Konten <span className="text-red-600">*</span>
            </label>
            <textarea
              name="isi_konten"
              value={formData.isi_konten}
              onChange={handleInputChange}
              placeholder="Tulis konten edukasi di sini..."
              rows={8}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.isi_konten ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.isi_konten && <p className="text-red-600 text-sm mt-1">{errors.isi_konten}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/cms/edukasi')}
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
