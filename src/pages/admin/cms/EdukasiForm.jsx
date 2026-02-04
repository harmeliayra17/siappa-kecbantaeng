import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { edukasiService, masterService } from '../../../services/dataService';
import { ArrowLeft, Save } from 'lucide-react';

export default function EdukasiForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [kategoris, setKategoris] = useState([]);

  const [formData, setFormData] = useState({
    judul_konten: '',
    isi_konten: '',
    penulis: '',
    kategori_id: '',
    featured_image_url: '',
  });

  useEffect(() => {
    fetchKategoris();
  }, []);

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
    if (!formData.judul_konten.trim()) newErrors.judul_konten = 'Judul wajib diisi';
    if (!formData.isi_konten.trim()) newErrors.isi_konten = 'Isi konten wajib diisi';
    if (!formData.penulis.trim()) newErrors.penulis = 'Penulis wajib diisi';
    if (!formData.kategori_id) newErrors.kategori_id = 'Kategori wajib dipilih';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const result = await edukasiService.createEdukasi({
        ...formData,
        kategori_id: parseInt(formData.kategori_id),
      });

      if (result?.success) {
        alert('Konten edukasi berhasil ditambahkan');
        navigate('/admin/cms/edukasi');
      } else {
        alert('Gagal menambahkan konten edukasi');
      }
    } catch (err) {
      console.error('Error creating edukasi:', err);
      alert('Terjadi kesalahan');
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
        <h1 className="text-3xl font-bold text-gray-900">Tambah Konten Edukasi</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Judul <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="judul_konten"
              value={formData.judul_konten}
              onChange={handleInputChange}
              placeholder="Masukkan judul konten"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.judul_konten ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.judul_konten && <p className="text-red-600 text-sm mt-1">{errors.judul_konten}</p>}
          </div>

          {/* Penulis */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Penulis <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="penulis"
              value={formData.penulis}
              onChange={handleInputChange}
              placeholder="Nama penulis"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.penulis ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.penulis && <p className="text-red-600 text-sm mt-1">{errors.penulis}</p>}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori <span className="text-red-600">*</span>
            </label>
            <select
              name="kategori_id"
              value={formData.kategori_id}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.kategori_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Pilih Kategori</option>
              {kategoris.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kategori}</option>
              ))}
            </select>
            {errors.kategori_id && <p className="text-red-600 text-sm mt-1">{errors.kategori_id}</p>}
          </div>

          {/* Featured Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image URL</label>
            <input
              type="url"
              name="featured_image_url"
              value={formData.featured_image_url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
