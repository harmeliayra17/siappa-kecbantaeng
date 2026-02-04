import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { settingsService } from '../../../services/dataService';
import ImageUpload from '../../../components/common/ImageUpload';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProfilContentCMS() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    profil_title: '',
    profil_vision: '',
    profil_mission: '',
    profil_about_text: '',
    profil_about_image: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_media_instagram: '',
    social_media_facebook: '',
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
      const result = await settingsService.getProfilSettings();
      if (result?.success && result.data) {
        setFormData(prev => ({
          ...prev,
          ...result.data,
        }));
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
      profil_about_image: url,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await settingsService.updateProfilSettings(formData);
      if (result?.success) {
        alert('Pengaturan halaman Profil berhasil disimpan');
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
        <h1 className="text-3xl font-bold text-gray-900">Kelola Konten Halaman Profil</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Utama</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul Halaman <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="profil_title"
                value={formData.profil_title}
                onChange={handleInputChange}
                placeholder="SI-APPA Kecamatan Bantaeng"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Visi & Misi</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Visi</label>
              <textarea
                name="profil_vision"
                value={formData.profil_vision}
                onChange={handleInputChange}
                placeholder="Visi organisasi..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Misi</label>
              <textarea
                name="profil_mission"
                value={formData.profil_mission}
                onChange={handleInputChange}
                placeholder="Misi organisasi..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* About Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Kami</h2>

            <ImageUpload
              value={formData.profil_about_image}
              onChange={handleImageChange}
              uploadType="website"
              label="Gambar Tentang Kami"
            />

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
              <textarea
                name="profil_about_text"
                value={formData.profil_about_text}
                onChange={handleInputChange}
                placeholder="Deskripsi lengkap tentang organisasi..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Kontak</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="0812-3456-7890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
              <textarea
                name="contact_address"
                value={formData.contact_address}
                onChange={handleInputChange}
                placeholder="Alamat lengkap..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Media Sosial</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                name="social_media_instagram"
                value={formData.social_media_instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook</label>
              <input
                type="url"
                name="social_media_facebook"
                value={formData.social_media_facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/..."
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
