import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MapPin, FileText, Hash, ArrowRight, Users, Shield, Zap, Heart, Phone } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { settingsService } from '../../services/dataService';

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // State Data Dinamis
  const [webSettings, setWebSettings] = useState({
    teks_sapaan: 'Selamat Datang di SI-APPA',
    home_hero_subtitle: 'Anda Tidak Sendiri, Kami Siap Melindungi',
    deskripsi_singkat: 'Sistem Informasi Asa Pemberdayaan Perempuan dan Anak (SI-APPA) Kecamatan Bantaeng hadir sebagai ruang aman bagi Anda untuk bersuara dan berdaya.',
    contact_phone: '',
  });

  const [stats, setStats] = useState({
    totalLaporan: 0,
    laporanPerempuan: 0,
    laporanAnak: 0,
    kasusSelesai: 0,
    desaTerlayani: 0,
    rataRataWaktu: '0'
  });
  
  const [loading, setLoading] = useState(true);
  
  // Gambar Default
  const defaultImages = [
    '/observasi-lembang-lembang.jpeg',
    '/sosialisasi-sd2lembangcina.jpeg',
    '/semproker.jpeg'
  ];

  const [heroImages, setHeroImages] = useState(defaultImages);

  // Efek Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages]);

  // Fetch Data
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Ambil Pengaturan Web
        const settingsResult = await settingsService.getSettings();
        if (isMounted && settingsResult.success && settingsResult.data) {
          setWebSettings(prev => ({ ...prev, ...settingsResult.data }));

          // Cek gambar hero
          const dbImages = [
            settingsResult.data.home_hero_image_1,
            settingsResult.data.home_hero_image_2,
            settingsResult.data.home_hero_image_3
          ].filter(img => img);

          if (dbImages.length > 0) {
            setHeroImages(dbImages);
          }
        }

        // 2. Ambil Statistik Laporan
        const { data: laporan, error } = await supabase
          .from('laporan_pengaduan')
          .select('status_kasus, created_at, tanggal_selesai, lokasi_kejadian, kategori_id'); 
          // Hapus .limit(1000) biar totalnya akurat semua

        if (error) throw error;

        if (isMounted && laporan && laporan.length > 0) {
          const total = laporan.length;
          // Pastikan 'Selesai' match dengan database (Case Sensitive)
          const selesai = laporan.filter(l => l.status_kasus === 'Selesai').length;
          
          // Desa Terlayani (Unik)
          const desaSet = new Set(laporan.map(l => l.lokasi_kejadian).filter(Boolean));
          const desa = desaSet.size;

          // Rata-rata Waktu Penyelesaian
          const selesaiLaporan = laporan.filter(l => l.status_kasus === 'Selesai' && l.tanggal_selesai);
          let rataRata = '0';
          
          if (selesaiLaporan.length > 0) {
            const totalHari = selesaiLaporan.reduce((sum, l) => {
              const created = new Date(l.created_at);
              const selesaiDate = new Date(l.tanggal_selesai);
              // Hitung selisih hari
              const diffTime = Math.abs(selesaiDate - created);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              return sum + diffDays;
            }, 0);
            rataRata = Math.round(totalHari / selesaiLaporan.length).toString();
          }

          // Hitung Kategori (Perempuan vs Anak)
          const kategoriIds = [...new Set(laporan.map(l => l.kategori_id).filter(Boolean))];
          let perempuanCount = 0;
          let anakCount = 0;

          if (kategoriIds.length > 0) {
            const { data: kategoriBatch } = await supabase
              .from('m_kategori_kasus')
              .select('id, kelompok')
              .in('id', kategoriIds);

            if (kategoriBatch) {
              // ✅ PERBAIKAN LOGIKA: Pakai map/reduce biar lebih efisien & akurat
              laporan.forEach(lapor => {
                const k = kategoriBatch.find(kat => kat.id === lapor.kategori_id);
                if (k) {
                  if (k.kelompok === 'Perempuan') perempuanCount++;
                  if (k.kelompok === 'Anak') anakCount++;
                }
              });
            }
          }

          setStats({
            totalLaporan: total,
            laporanPerempuan: perempuanCount,
            laporanAnak: anakCount,
            kasusSelesai: selesai,
            desaTerlayani: desa,
            rataRataWaktu: rataRata
          });
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800 selection:bg-accent selection:text-white" style={{
      background: 'linear-gradient(135deg, #ede8f5 0%, #e8d5f2 20%, #f5f0fa 40%, #e8d5f2 60%, #ede8f5 80%, #e8d5f2 100%)'
    }}>
      
      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-0 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center md:text-left animate-fade-in-up mt-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6 leading-tight">
              <br/>
              <span className="text-primary">{webSettings.teks_sapaan}</span>
            </h1>
            <p className="gradient-text text-xl md:text-2xl font-semibold mb-6">
               "{webSettings.home_hero_subtitle}"
            </p>
            <p className="text-lg md:text-xl text-body mb-8 leading-relaxed max-w-lg">
              {webSettings.deskripsi_singkat}
            </p>

            {/* Kontak Cepat */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-600 justify-center md:justify-start">
               {webSettings.contact_phone && (
                 <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-primary/20">
                    <Phone size={16} className="text-primary"/> {webSettings.contact_phone}
                 </div>
               )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/lapor">
                <button className="btn-primary px-8 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 w-full sm:w-auto">
                   <FileText className="w-5 h-5"/> Laporkan Sekarang
                </button>
              </Link>
              <Link to="/agenda">
                <button className="btn-secondary px-8 py-3 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto font-semibold">
                   Lihat Kegiatan <ArrowRight className="w-5 h-5"/>
                </button>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative w-full h-[450px] mt-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50">
              {heroImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Carousel ${idx + 1}`}
                  className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                    idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK SECTION */}
      <section className="py-24 px-0 relative">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-heading mb-4">Statistik Transparansi</h2>
          <p className="text-center text-body text-lg md:text-xl mb-12">Komitmen kami dalam melayani masyarakat</p>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="card-clean hover-lift p-8 text-center relative">
              <div className="icon-container mx-auto mb-4"><FileText className="w-7 h-7 text-primary" /></div>
              <h3 className="text-2xl md:text-3xl font-bold text-heading mb-2 relative z-10">{loading ? '-' : stats.totalLaporan}</h3>
              <p className="text-body text-sm relative z-10">Total Laporan</p>
            </div>

            <div className="card-clean hover-lift p-8 text-center relative overflow-hidden">
              <div className="icon-container mx-auto mb-4 relative z-10"><Heart className="w-7 h-7 text-primary" /></div>
              <h3 className="text-2xl md:text-3xl font-bold text-heading mb-2 relative z-10">{loading ? '-' : stats.laporanPerempuan}</h3>
              <p className="text-body text-sm relative z-10">Kasus Perempuan</p>
            </div>

            <div className="card-clean hover-lift p-8 text-center relative overflow-hidden">
              <div className="icon-container mx-auto mb-4 relative z-10"><Users className="w-7 h-7 text-primary" /></div>
              <h3 className="text-2xl md:text-3xl font-bold text-heading mb-2 relative z-10">{loading ? '-' : stats.laporanAnak}</h3>
              <p className="text-body text-sm relative z-10">Kasus Anak</p>
            </div>

            <div className="card-clean hover-lift p-8 text-center relative overflow-hidden">
              <div className="icon-container mx-auto mb-4 relative z-10"><CheckCircle className="w-7 h-7 text-primary" /></div>
              <h3 className="text-2xl md:text-3xl font-bold text-heading mb-2 relative z-10">{loading ? '-' : stats.kasusSelesai}</h3>
              <p className="text-body text-sm relative z-10">Kasus Selesai</p>
            </div>

            <div className="card-clean hover-lift p-8 text-center relative overflow-hidden">
              <div className="icon-container mx-auto mb-4 relative z-10"><MapPin className="w-7 h-7 text-primary" /></div>
              <h3 className="text-2xl md:text-3xl font-bold text-heading mb-2 relative z-10">{loading ? '-' : stats.desaTerlayani}</h3>
              <p className="text-body text-sm relative z-10">Desa Terlayani</p>
            </div>

            <div className="card-clean hover-lift p-8 text-center relative overflow-hidden">
              <div className="icon-container mx-auto mb-4 relative z-10"><Zap className="w-7 h-7 text-primary" /></div>
              <h3 className="text-2xl md:text-3xl font-bold text-heading mb-2 relative z-10">{loading ? '-' : stats.rataRataWaktu} hari</h3>
              <p className="text-body text-sm relative z-10">Rata-rata Proses</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROSES PELAPORAN */}
      <section className="py-24 px-0 relative">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-heading mb-3">Bagaimana Cara Melaporkan?</h2>
            <p className="text-body text-lg md:text-xl">Proses pelaporan yang mudah, aman, dan transparan</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
             {[
                { icon: FileText, number: '1', title: 'Tulis Laporan', desc: 'Isi formulir pengaduan dengan lengkap dan kronologis' },
                { icon: Hash, number: '2', title: 'Dapat Tiket', desc: 'Dapatkan kode unik tiket untuk melacak status kasus' },
                { icon: Users, number: '3', title: 'Diproses', desc: 'Tim Satgas profesional kami akan memverifikasi dan menangani' },
                { icon: CheckCircle, number: '4', title: 'Selesai', desc: 'Kasus ditangani hingga tuntas dengan pendampingan' },
             ].map((item, i) => (
                <div key={i} className="relative flex flex-col">
                  <div className="card-clean px-6 py-8 text-center hover-lift h-full border border-transparent hover:border-primary/20 transition">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-primary/30">
                      {item.number}
                    </div>
                    <item.icon className="w-10 h-10 text-primary mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold text-heading mb-2">{item.title}</h3>
                    <p className="text-body text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* FITUR UNGGULAN */}
      <section className="py-24 px-0 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-heading mb-3">Mengapa Memilih SI-APPA?</h2>
            <p className="text-body text-lg md:text-xl">Kami berkomitmen melayani Anda dengan profesional dan terpercaya</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Shield, title: 'Privasi Terjamin', desc: 'Identitas Anda dilindungi dengan keamanan tingkat tinggi', img: '/privacy.jpg' },
              { icon: Zap, title: 'Respon Cepat', desc: 'Tim kami siap merespon pengaduan dalam 24 jam', img: '/respon.jpg' },
              { icon: Heart, title: 'Dukungan Penuh', desc: 'Konseling dan pendampingan tersedia untuk Anda', img: '/support.jpg' },
            ].map((item, i) => (
              <div key={i} className="card-clean hover-lift overflow-hidden h-full">
                <img src={item.img} alt={item.title} className="w-full h-40 object-cover" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-heading">{item.title}</h3>
                  </div>
                  <p className="text-body text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}