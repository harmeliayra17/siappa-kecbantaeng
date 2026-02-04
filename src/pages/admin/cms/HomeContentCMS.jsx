import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { settingsService } from '../../../services/dataService';
import ImageUpload from '../../../components/common/ImageUpload';
import { ArrowLeft, Save } from 'lucide-react';

export default function HomeContentCMS() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    home_hero_title: '',
    home_hero_subtitle: '',
    home_hero_cta_text: '',
    home_hero_image_1: '',
    home_hero_image_2: '',
    home_hero_image_3: '',
    home_stats_section_title: '',
    home_stats_section_subtitle: '',
    home_features_section_title: '',
    home_features_section_subtitle: '',
    home_process_section_title: '',
    home_process_section_subtitle: '',
  });

  useEffect(() => {
    if (!isSuperAdmin()) {
      navigate('/admin/dashboard');
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const result = await settingsService.getHomeSettings();
      if (result?.success && result.data) {
        setFormData({
          home_hero_title: result.data.home_hero_title || '',
          home_hero_subtitle: result.data.home_hero_subtitle || '',
          home_hero_cta_text: result.data.home_hero_cta_text || '',
          home_hero_image_1: result.data.home_hero_image_1 || '',
          home_hero_image_2: result.data.home_hero_image_2 || '',
          home_hero_image_3: result.data.home_hero_image_3 || '',
          home_stats_section_title: result.data.home_stats_section_title || '',
          home_stats_section_subtitle: result.data.home_stats_section_subtitle || '',
          home_features_section_title: result.data.home_features_section_title || '',
          home_features_section_subtitle: result.data.home_features_section_subtitle || '',
          home_process_section_title: result.data.home_process_section_title || '',
          home_process_section_subtitle: result.data.home_process_section_subtitle || '',
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (url, path) => {
    setFormData(prev => ({
      ...prev,
      home_hero_image: url,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await settingsService.updateHomeSettings(formData);
      if (result?.success) {
        alert('Pengaturan halaman Home berhasil disimpan');
        navigate('/admin/cms/website');
      } else {
        alert('Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/cms/website')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Konten Halaman Home</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bagian Hero (3 Gambar Carousel)</h2>

            <div className="space-y-4">
              <ImageUpload
                value={formData.home_hero_image_1}
                onChange={(url, path) => setFormData(prev => ({ ...prev, home_hero_image_1: url }))}
                uploadType="website"
                label="Gambar Hero 1"
                maxWidth={600}
              />

              <ImageUpload
                value={formData.home_hero_image_2}
                onChange={(url, path) => setFormData(prev => ({ ...prev, home_hero_image_2: url }))}
                uploadType="website"
                label="Gambar Hero 2"
                maxWidth={600}
              />

              <ImageUpload
                value={formData.home_hero_image_3}
                onChange={(url, path) => setFormData(prev => ({ ...prev, home_hero_image_3: url }))}
                uploadType="website"
                label="Gambar Hero 3"
                maxWidth={600}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul Utama <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="home_hero_title"
                value={formData.home_hero_title}
                onChange={handleInputChange}
                placeholder="Contoh: Anda Tidak Sendiri, Kami Siap Melindungi."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
              <textarea
                name="home_hero_subtitle"
                value={formData.home_hero_subtitle}
                onChange={handleInputChange}
                placeholder="Deskripsi sistem..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                name="home_hero_cta_text"
                value={formData.home_hero_cta_text}
                onChange={handleInputChange}
                placeholder="Contoh: Lapor Sekarang"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bagian Statistik</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Bagian</label>
              <input
                type="text"
                name="home_stats_section_title"
                value={formData.home_stats_section_title}
                onChange={handleInputChange}
                placeholder="Statistik Transparansi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                name="home_stats_section_subtitle"
                value={formData.home_stats_section_subtitle}
                onChange={handleInputChange}
                placeholder="Komitmen kami dalam melayani"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bagian Fitur</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Bagian</label>
              <input
                type="text"
                name="home_features_section_title"
                value={formData.home_features_section_title}
                onChange={handleInputChange}
                placeholder="Mengapa Memilih SI-APPA?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                name="home_features_section_subtitle"
                value={formData.home_features_section_subtitle}
                onChange={handleInputChange}
                placeholder="Kami berkomitmen melayani Anda dengan profesional dan terpercaya"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Process Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bagian Proses Pelaporan</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Bagian</label>
              <input
                type="text"
                name="home_process_section_title"
                value={formData.home_process_section_title}
                onChange={handleInputChange}
                placeholder="Bagaimana Cara Melaporkan?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                name="home_process_section_subtitle"
                value={formData.home_process_section_subtitle}
                onChange={handleInputChange}
                placeholder="Proses pelaporan yang mudah, aman, dan transparan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/cms/website')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
