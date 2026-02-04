import React from 'react';
import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-primary to-secondary text-white">
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
              />
              <span className="text-xl font-bold">SI-APPA</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Sistem Informasi Perlindungan Perempuan dan Anak Pemberdayaan Kecamatan Bantaeng. Melayani dengan hati, melindungi yang terpinggirkan.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
                <Twitter className="w-5 h-5" />
              </a>
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

          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="font-bold text-base mb-4">Hubungi Kami</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 text-white/60" />
                <div>
                  <p className="font-semibold">Alamat</p>
                  <p className="text-white/80">Kantor Camat Bantaeng<br/>Jl. Pendidikan No. 1<br/>Kabupaten Bantaeng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom 4: Kontak Info */}
          <div>
            <h3 className="font-bold text-base mb-4">Layanan 24/7</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 text-white/60 mt-0.5" />
                <div>
                  <p className="font-semibold">WhatsApp Pengaduan</p>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition">
                    +62 812-3456-7890
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 text-white/60 mt-0.5" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:pengaduan@siappa.bantaeng.go.id" className="text-white/80 hover:text-white transition">
                    pengaduan@siappa.bantaeng.go.id
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
            &copy; {currentYear} SI-APPA Kecamatan Bantaeng. Semua hak dilindungi.
          </p>
          <p>
            KKN 115 Universitas Hasanuddin
          </p>
        </div>
      </div>
    </footer>
  );
}
