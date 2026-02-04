import React, { useState, useEffect } from 'react';
import { Save, Image, Type, AlertCircle } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';

export default function WebsitePublikCMS() {
  const [sections, setSections] = useState({
    hero: {
      title: 'Anda Tidak Sendiri, Kami Siap Melindungi.',
      description: 'Sistem Informasi Asa Pemberdayaan Perempuan dan Anak (SI-APPA) Kecamatan Bantaeng hadir sebagai ruang aman bagi Anda untuk bersuara dan berdaya.',
      image: '/observasi-lembang-lembang.jpg'
    },
    statistik: {
      title: 'Statistik Transparansi',
      subtitle: 'Komitmen kami dalam melayani'
    },
    caraLapor: {
      title: 'Bagaimana Cara Melaporkan?',
      subtitle: 'Proses pelaporan yang mudah, aman, dan transparan'
    },
    mengapa: {
      title: 'Mengapa Memilih SI-APPA?',
      subtitle: 'Kami berkomitmen melayani Anda dengan profesional dan terpercaya'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load dari Supabase jika ada
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('web_settings')
          .select('*')
          .eq('key', 'homepage_content')
          .single();

        if (data && data.value) {
          setSections(JSON.parse(data.value));
        }
      } catch (err) {
        console.log('No saved settings yet');
      }
    };

    loadSettings();
  }, []);

  const handleSectionChange = (section, field, value) => {
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      // Upsert ke database
      const { error } = await supabase
        .from('web_settings')
        .upsert({
          key: 'homepage_content',
          value: JSON.stringify(sections),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setLoading(false);
    }
  };

  const SectionEditor = ({ title, section, fields }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
        <Type size={20} />
        {title}
      </h3>
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={sections[section]?.[field.name] || ''}
                onChange={(e) => handleSectionChange(section, field.name, e.target.value)}
                rows={field.rows || 3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : field.type === 'image' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={sections[section]?.[field.name] || ''}
                  onChange={(e) => handleSectionChange(section, field.name, e.target.value)}
                  placeholder="URL gambar (contoh: /nama-file.jpg)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
                {sections[section]?.[field.name] && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={sections[section]?.[field.name]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={sections[section]?.[field.name] || ''}
                onChange={(e) => handleSectionChange(section, field.name, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading mb-2">CMS Website Publik</h1>
          <p className="text-gray-600">Kelola konten halaman utama website SI-APPA</p>
        </div>

        {/* Alerts */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-green-700 font-medium">Perubahan berhasil disimpan!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-6 mb-8">
          <SectionEditor
            title="Hero Section"
            section="hero"
            fields={[
              { name: 'title', label: 'Judul Utama', type: 'text' },
              { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 3 },
              { name: 'image', label: 'Gambar Hero', type: 'image' }
            ]}
          />

          <SectionEditor
            title="Statistik Transparansi"
            section="statistik"
            fields={[
              { name: 'title', label: 'Judul Section', type: 'text' },
              { name: 'subtitle', label: 'Subtitle', type: 'text' }
            ]}
          />

          <SectionEditor
            title="Bagaimana Cara Melaporkan"
            section="caraLapor"
            fields={[
              { name: 'title', label: 'Judul Section', type: 'text' },
              { name: 'subtitle', label: 'Subtitle', type: 'text' }
            ]}
          />

          <SectionEditor
            title="Mengapa Memilih SI-APPA"
            section="mengapa"
            fields={[
              { name: 'title', label: 'Judul Section', type: 'text' },
              { name: 'subtitle', label: 'Subtitle', type: 'text' }
            ]}
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition"
          >
            <Save size={20} />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            onClick={() => window.location.href = '/'}
          >
            Lihat Preview
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tips:</strong> Perubahan akan langsung terlihat di halaman publik setelah disimpan. 
            Untuk gambar, pastikan URL file tersedia di folder <code className="bg-blue-100 px-2 py-1 rounded">/public</code>
          </p>
        </div>
      </div>
    </div>
  );
}
