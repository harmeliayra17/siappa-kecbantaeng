import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { settingsService } from '../../../services/dataService';
import { Save } from 'lucide-react';

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    nama_aplikasi: '',
    deskripsi_singkat: '',
    email_kontak: '',
    nomor_telepon: '',
    alamat_kantor: '',
    jam_kerja: '',
  });

  useEffect(() => {
    if (!isSuperAdmin()) {
      return;
    }
    fetchSettings();
  }, [isSuperAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const result = await settingsService.getSettings();
      if (result?.success && result.data) {
        setSettings(result.data);
        setFormData(result.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const result = await settingsService.updateSettings(formData);

      if (result?.success) {
        alert('Pengaturan berhasil diperbarui');
        setSettings(formData);
      } else {
        alert('Gagal memperbarui pengaturan');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Website</h1>
        <p className="text-gray-600 mt-2">Kelola informasi dan konfigurasi website</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Aplikasi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Aplikasi</label>
            <input
              type="text"
              name="nama_aplikasi"
              value={formData.nama_aplikasi}
              onChange={handleInputChange}
              placeholder="SI-APPA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Deskripsi Singkat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat</label>
            <textarea
              name="deskripsi_singkat"
              value={formData.deskripsi_singkat}
              onChange={handleInputChange}
              placeholder="Deskripsi aplikasi..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Email Kontak */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Kontak</label>
            <input
              type="email"
              name="email_kontak"
              value={formData.email_kontak}
              onChange={handleInputChange}
              placeholder="kontakt@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Nomor Telepon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
            <input
              type="tel"
              name="nomor_telepon"
              value={formData.nomor_telepon}
              onChange={handleInputChange}
              placeholder="+62 xxx xxxx xxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Alamat Kantor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Kantor</label>
            <textarea
              name="alamat_kantor"
              value={formData.alamat_kantor}
              onChange={handleInputChange}
              placeholder="Alamat lengkap kantor..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Jam Kerja */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Kerja</label>
            <input
              type="text"
              name="jam_kerja"
              value={formData.jam_kerja}
              onChange={handleInputChange}
              placeholder="Senin-Jumat: 08:00-17:00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="reset"
              onClick={() => setFormData(settings || {})}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
