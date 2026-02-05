import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { settingsService } from '../../services/dataService'; 

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // State default (Loading state)
  const [settings, setSettings] = useState({
    teks_sapaan: 'SI-APPA',
    home_hero_subtitle: 'Sistem Informasi Perlindungan Perempuan dan Anak Pemberdayaan Kecamatan Bantaeng.',
    contact_address: 'Kantor Camat Bantaeng',
    contact_phone: '-',
    contact_email: '-',
    social_media_facebook: '',
    social_media_instagram: ''
  });

  // Ambil data dari database saat loading
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await settingsService.getSettings();
        if (result.success && result.data) {
          setSettings(prev => ({ ...prev, ...result.data }));
        }
      } catch (error) {
        console.error("Gagal memuat footer:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gradient-to-r from-primary to-secondary text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Kolom 1: Identitas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/si-appa-logo.png"  
                alt="SI-APPA Logo"
                className="w-8 h-8 object-contain rounded-full bg-white/20 p-1" 
                onError={(e) => e.target.style.display = 'none'}
              />
              {/* Dinamis: Nama Aplikasi */}
              <span className="text-xl font-bold">SI-APPA</span>
            </div>
            {/* Dinamis: Deskripsi */}
            <p className="text-sm text-white/80 leading-relaxed">
              Sistem Informasi Perlindungan Perempuan dan Anak Pemberdayaan Kecamatan Bantaeng.
            </p>
            
            <div className="flex gap-3 pt-2">
              {/* Dinamis: Facebook (Hanya muncul jika ada link) */}
              {settings.social_media_facebook && (
                <a href={settings.social_media_facebook} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {/* Dinamis: Instagram (Hanya muncul jika ada link) */}
              {settings.social_media_instagram && (
                <a href={settings.social_media_instagram} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Kolom 2: Akses Cepat */}
          <div>
            <h3 className="font-bold text-base mb-4">Akses Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition">
                  • Beranda
                </Link>
              </li>
              <li>
                <Link to="/lapor" className="text-white/80 hover:text-white transition">
                  • Buat Laporan
                </Link>
              </li>
              <li>
                <Link to="/lapor" className="text-white/80 hover:text-white transition">
                  • Cek Status
                </Link>
              </li>
              <li>
                <Link to="/agenda" className="text-white/80 hover:text-white transition">
                  • Agenda Kegiatan
                </Link>
              </li>
              <li>
                <Link to="/edukasi" className="text-white/80 hover:text-white transition">
                  • Edukasi & Tips
                </Link>
              </li>
              <li>
                <Link to="/profil" className="text-white/80 hover:text-white transition">
                  • Profil Satgas
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak (Alamat) */}
          <div>
            <h3 className="font-bold text-base mb-4">Hubungi Kami</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 text-white/60" />
                <div>
                  <p className="font-semibold">Alamat</p>
                  {/* Dinamis: Alamat */}
                  <p className="text-white/80 whitespace-pre-line">
                    {settings.contact_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom 4: Kontak Info (HP & Email) */}
          <div>
            <h3 className="font-bold text-base mb-4">Layanan</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 text-white/60 mt-0.5" />
                <div>
                  <p className="font-semibold">WhatsApp Pengaduan</p>
                  {/* Dinamis: No HP & Link WA Otomatis */}
                  <a 
                    href={`https://wa.me/${settings.contact_phone?.replace(/\D/g,'')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/80 hover:text-white transition"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 text-white/60 mt-0.5" />
                <div>
                  <p className="font-semibold">Email</p>
                  {/* Dinamis: Email */}
                  <a href={`mailto:${settings.contact_email}`} className="text-white/80 hover:text-white transition">
                    {settings.contact_email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20"></div>

        {/* Bottom Footer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
          <p>
            &copy; {currentYear} {settings.teks_sapaan}. Kecamatan Bantaeng. Semua hak dilindungi.
          </p>
          <p>
            KKN 115 Universitas Hasanuddin
          </p>
        </div>
      </div>
    </footer>
  );
}