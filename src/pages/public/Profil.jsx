import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Users, Search, Building2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { settingsService } from '../../services/dataService';

export default function Profil() {
  const [satgas, setSatgas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesa, setSelectedDesa] = useState('');
  const [desas, setDesas] = useState([]);
  const [profilSettings, setProfilSettings] = useState({
    profil_title: 'Profil Satgas & Kontak',
    profil_vision: '',
    profil_mission: '',
    profil_about_text: 'Tim Perlindungan Perempuan dan Anak di setiap desa',
    profil_about_image: null,
    contact_email: 'pengaduan@siappa.bantaeng.go.id',
    contact_phone: '+62 812-3456-7890',
    contact_address: 'Kecamatan Bantaeng',
    social_media_instagram: '',
    social_media_facebook: ''
  });

  // Fetch profil settings
  useEffect(() => {
    let isMounted = true;

    const fetchProfilSettings = async () => {
      try {
        const result = await settingsService.getProfilSettings();
        if (isMounted && result.success && result.data) {
          setProfilSettings(prev => ({
            ...prev,
            ...result.data
          }));
        }
      } catch (err) {
        console.error('Error fetching profil settings:', err);
      }
    };

    fetchProfilSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch satgas data
  useEffect(() => {
    const fetchSatgas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('data_satgas')
          .select('*')
          .order('nama_desa', { ascending: true });

        if (error) throw error;
        setSatgas(data || []);

        // Extract unique desa
        const uniqueDesas = [...new Set(data?.map(s => s.nama_desa) || [])];
        setDesas(uniqueDesas);
      } catch (err) {
        console.error('Error fetching satgas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSatgas();
  }, []);

  // Filter satgas
  const filteredSatgas = satgas.filter(s => {
    const matchSearch = 
      s.nama_satgas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nama_desa.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesa = !selectedDesa || s.nama_desa === selectedDesa;
    return matchSearch && matchDesa;
  });

  // Group by desa
  const groupedBySatgas = {};
  filteredSatgas.forEach(s => {
    if (!groupedBySatgas[s.nama_desa]) {
      groupedBySatgas[s.nama_desa] = [];
    }
    groupedBySatgas[s.nama_desa].push(s);
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-6" style={{
      background: 'linear-gradient(135deg, #ede8f5 0%, #e8d5f2 20%, #f5f0fa 40%, #e8d5f2 60%, #ede8f5 80%, #e8d5f2 100%)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-3">{profilSettings.profil_title || 'Profil Satgas & Kontak'}</h1>
          <p className="text-lg text-body">{profilSettings.profil_about_text || 'Tim Perlindungan Perempuan dan Anak di setiap desa'}</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4 bg-white rounded-xl p-6 shadow-md">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama satgas atau desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Desa Filter */}
          <div>
            <p className="text-sm font-semibold text-heading mb-3">Filter Desa</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedDesa('')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition text-sm ${
                  !selectedDesa
                    ? 'bg-primary text-white'
                    : 'bg-white text-heading border border-gray-300 hover:border-primary'
                }`}
              >
                Semua Desa
              </button>
              {desas.map(desa => (
                <button
                  key={desa}
                  onClick={() => setSelectedDesa(desa)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap text-sm ${
                    selectedDesa === desa
                      ? 'bg-primary text-white'
                      : 'bg-white text-heading border border-gray-300 hover:border-primary'
                  }`}
                >
                  {desa.split(' ').pop()}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Menampilkan <strong>{filteredSatgas.length}</strong> anggota satgas
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse mb-4 mx-auto"></div>
              <p className="text-gray-600">Memuat data satgas...</p>
            </div>
          </div>
        ) : filteredSatgas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Tidak ada satgas ditemukan</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedBySatgas).map(([desa, members]) => (
              <div key={desa} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Desa Header */}
                <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">{desa}</h3>
                  </div>
                  <p className="text-white/80 mt-2">{members.length} anggota satgas</p>
                </div>

                {/* Members Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border-l-4 border-primary hover:shadow-lg transition"
                    >
                      {/* Position Badge */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                          {member.jabatan}
                        </span>
                      </div>

                      {/* Name */}
                      <h4 className="font-bold text-lg text-heading mb-1">{member.nama_satgas}</h4>
                      <p className="text-sm text-gray-600 mb-4">{member.nama_desa}</p>

                      {/* Contact */}
                      <div className="space-y-2">
                        <a
                          href={`https://wa.me/${member.nomor_kontak.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-secondary transition font-semibold"
                        >
                          <Phone className="w-4 h-4" />
                          {member.nomor_kontak}
                        </a>
                      </div>

                      {/* Action Button */}
                      <button className="w-full mt-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition">
                        Hubungi
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Info */}
        <div className="mt-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-4">🚨 SITUASI DARURAT?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/90 mb-2">Hubungi Layanan Pengaduan 24/7:</p>
              <a
                href={`https://wa.me/${profilSettings.contact_phone?.replace(/[^\d]/g, '') || '6281234567890'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl font-bold text-white hover:underline"
              >
                {profilSettings.contact_phone || '+62 812-3456-7890'}
              </a>
            </div>
            <div>
              <p className="text-white/90 mb-2">Email Pengaduan:</p>
              <a
                href={`mailto:${profilSettings.contact_email || 'pengaduan@siappa.bantaeng.go.id'}`}
                className="text-lg font-bold text-white hover:underline"
              >
                {profilSettings.contact_email || 'pengaduan@siappa.bantaeng.go.id'}
              </a>
            </div>
          </div>
          <p className="mt-4 text-white/80 text-sm">
            Jangan ragu untuk menghubungi kami. Keamanan dan privasi Anda adalah prioritas kami.
          </p>
        </div>
      </div>
    </div>
  );
}
