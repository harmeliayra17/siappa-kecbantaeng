import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { edukasiService } from '../../../services/dataService';
import ImageUpload from '../../../components/common/ImageUpload';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function EdukasiForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari URL jika ada (Mode Edit)
  
  // State Utama
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});

  // State Form (Sesuai kolom Database: konten_edukasi)
  const [formData, setFormData] = useState({
    judul_artikel: '',
    isi_konten: '',
    kategori: '',
    gambar_thumbnail: '',
  });

  // Pilihan Kategori Artikel (Hardcoded biar stabil)
  const kategoriOptions = [
    "Kesehatan", 
    "Hukum", 
    "Parenting", 
    "Psikologi", 
    "Tips & Trik", 
    "Berita"
  ];

  // 1. Cek apakah ini Mode Edit atau Tambah
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchDataForEdit(id);
    }
  }, [id]);

  // 2. Fungsi Ambil Data Lama (Khusus Edit)
  const fetchDataForEdit = async (contentId) => {
    try {
      setLoading(true);
      const result = await edukasiService.getEdukasiById(contentId);

      if (result?.success && result.data) {
        // Mapping data dari Database ke State Form
        setFormData({
          judul_artikel: result.data.judul_artikel || '',
          isi_konten: result.data.isi_konten || '',
          kategori: result.data.kategori || '',
          gambar_thumbnail: result.data.gambar_thumbnail || '',
        });
      } else {
        alert("Data tidak ditemukan!");
        navigate('/admin/cms/edukasi');
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setSubmitError("Gagal mengambil data untuk diedit.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Perubahan Input Teks
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Hapus error jika user mulai mengetik
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 4. Validasi Form Sebelum Submit
  const validateForm = () => {
    const newErrors = {};
    if (!formData.judul_artikel.trim()) newErrors.judul_artikel = 'Judul wajib diisi';
    if (!formData.isi_konten.trim()) newErrors.isi_konten = 'Isi konten wajib diisi';
    if (!formData.kategori) newErrors.kategori = 'Pilih salah satu kategori';
    
    return newErrors;
  };

  // 5. Handle Submit (Simpan / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Cek Validasi
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Mohon lengkapi semua field yang wajib.');
      window.scrollTo(0, 0); // Scroll ke atas biar lihat error
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      let result;

      if (isEditMode) {
        // UPDATE Existing Data
        result = await edukasiService.updateEdukasi(id, formData);
      } else {
        // CREATE New Data
        result = await edukasiService.createEdukasi(formData);
      }

      if (result?.success) {
        alert(isEditMode ? 'Artikel berhasil diperbarui!' : 'Artikel berhasil diterbitkan!');
        navigate('/admin/cms/edukasi');
      } else {
        setSubmitError(result?.error || 'Gagal menyimpan data ke database.');
      }
    } catch (err) {
      console.error('Submit Error:', err);
      setSubmitError('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-12">
      {/* Header Halaman */}
      <div className="flex items-center gap-4 pt-6">
        <button
          onClick={() => navigate('/admin/cms/edukasi')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Artikel Edukasi' : 'Tambah Artikel Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Pesan Error Global */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <p>{submitError}</p>
            </div>
          )}

          {/* Upload Gambar Thumbnail */}
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Gambar Thumbnail</label>
             <div className="bg-gray-50 p-1 rounded-lg">
               <ImageUpload
                  value={formData.gambar_thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, gambar_thumbnail: url }))}
                  uploadType="edukasi" // Pastikan bucket permissions sudah benar
                  label="Klik atau seret gambar ke sini"
                  maxWidth={800}
                />
             </div>
             <p className="text-xs text-gray-500 mt-2">Disarankan ukuran 800x400px (Landscape). Max 5MB.</p>
          </div>

          {/* Input Judul */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Judul Artikel <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="judul_artikel"
              value={formData.judul_artikel}
              onChange={handleInputChange}
              placeholder="Contoh: Mengenal Tanda-Tanda Kekerasan Dini"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                errors.judul_artikel ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300'
              }`}
            />
            {errors.judul_artikel && <p className="text-red-600 text-xs mt-1">{errors.judul_artikel}</p>}
          </div>

          {/* Input Kategori */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Kategori <span className="text-red-600">*</span>
            </label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white cursor-pointer ${
                errors.kategori ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300'
              }`}
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.kategori && <p className="text-red-600 text-xs mt-1">{errors.kategori}</p>}
          </div>

          {/* Input Isi Konten */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Isi Artikel <span className="text-red-600">*</span>
            </label>
            <textarea
              name="isi_konten"
              value={formData.isi_konten}
              onChange={handleInputChange}
              placeholder="Tuliskan isi artikel edukasi secara lengkap di sini..."
              rows={15}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-y ${
                errors.isi_konten ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300'
              }`}
            />
            {errors.isi_konten && <p className="text-red-600 text-xs mt-1">{errors.isi_konten}</p>}
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/cms/edukasi')}
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
              {loading ? 'Sedang Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Terbitkan Artikel')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}