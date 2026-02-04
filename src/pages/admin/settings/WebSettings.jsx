import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { settingsService } from '../../../services/dataService';
import { Save, AlertCircle, Facebook, Instagram, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../../../components/common/ImageUpload';

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State Form (Tanpa Jam Kerja & Twitter)
  const [formData, setFormData] = useState({
    teks_sapaan: '',          
    home_hero_subtitle: '',   
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_media_facebook: '',
    social_media_instagram: '',
    home_hero_image_1: '',
    home_hero_image_2: '',
    home_hero_image_3: '',
  });

  useEffect(() => {
    if (isSuperAdmin()) fetchSettings();
  }, [isSuperAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const result = await settingsService.getSettings();
      if (result?.success && result.data) {
        setFormData({
          teks_sapaan: result.data.teks_sapaan || '',
          home_hero_subtitle: result.data.home_hero_subtitle || '',
          contact_email: result.data.contact_email || '',
          contact_phone: result.data.contact_phone || '',
          contact_address: result.data.contact_address || '',
          social_media_facebook: result.data.social_media_facebook || '',
          social_media_instagram: result.data.social_media_instagram || '',
          home_hero_image_1: result.data.home_hero_image_1 || '',
          home_hero_image_2: result.data.home_hero_image_2 || '',
          home_hero_image_3: result.data.home_hero_image_3 || '',
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setMessage({ type: 'error', text: 'Gagal mengambil data pengaturan.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpdate = (field, url) => {
    setFormData(prev => ({ ...prev, [field]: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await settingsService.updateSettings({ id: 1, ...formData });
      if (result?.success) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
        window.scrollTo(0, 0);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Website</h1>
        <p className="text-gray-600 mt-2">Kelola informasi website, gambar slider, dan kontak.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <AlertCircle size={20} /> <p>{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section Gambar Hero */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <ImageIcon size={20}/> Gambar Slider (Hero)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((num) => (
                <div key={num}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slide {num}</label>
                  <ImageUpload 
                    value={formData[`home_hero_image_${num}`]} 
                    onChange={(url) => handleImageUpdate(`home_hero_image_${num}`, url)}
                    uploadType="website" 
                    label={`Upload Gambar ${num}`}
                    maxWidth={800}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 italic">* Format Landscape (16:9). Jika kosong, akan menggunakan gambar default.</p>
          </div>

          {/* Identitas Website */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Identitas & Teks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Utama</label>
                <input type="text" name="teks_sapaan" value={formData.teks_sapaan} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Judul</label>
                <input type="text" name="home_hero_subtitle" value={formData.home_hero_subtitle} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Kontak & Alamat */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Kontak Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
                <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                <textarea name="contact_address" value={formData.contact_address} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Sosmed */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Sosial Media</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Facebook className="absolute left-3 top-2.5 text-blue-600 w-5 h-5" />
                <input type="url" name="social_media_facebook" value={formData.social_media_facebook} onChange={handleInputChange} placeholder="Link Facebook" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="relative">
                <Instagram className="absolute left-3 top-2.5 text-pink-600 w-5 h-5" />
                <input type="url" name="social_media_instagram" value={formData.social_media_instagram} onChange={handleInputChange} placeholder="Link Instagram" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}