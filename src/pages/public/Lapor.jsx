import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Clock, ArrowRight, Download, Share2, MapPin, Calendar, User, Phone, Eye, EyeOff, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function Lapor() {
  const [activeTab, setActiveTab] = useState('buat'); // 'buat' atau 'cek'
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [statusLaporan, setStatusLaporan] = useState(null);
  const [searchTiket, setSearchTiket] = useState('');
  const [showIdentity, setShowIdentity] = useState(true);

  // Form Buat Lapor - Multi step
  const [currentStep, setCurrentStep] = useState(1);
  const [formBuat, setFormBuat] = useState({
    status_pelapor: 'Korban',
    nama_pelapor: '',
    kontak_pelapor: '',
    kategori_id: '',
    kronologi: '',
    lokasi_kejadian: '',
    bukti_foto: '',
    usia: '',
    hubungan_korban: ''
  });

  const [messageBuat, setMessageBuat] = useState({ type: '', text: '' });

  // Fetch kategori saat mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('m_kategori_kasus')
          .select('*')
          .order('kelompok', { ascending: true });
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle form perubahan
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormBuat(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validasi step
  const validateStep = (step) => {
    if (step === 1) {
      return formBuat.status_pelapor && formBuat.kontak_pelapor;
    } else if (step === 2) {
      return formBuat.kategori_id && formBuat.kronologi && formBuat.lokasi_kejadian;
    } else if (step === 3) {
      return true; // Bukti foto opsional
    }
    return false;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      alert('Silakan isi semua field yang wajib');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit buat lapor
  const handleBuatLapor = async (e) => {
    e.preventDefault();
    
    if (!formBuat.kontak_pelapor || !formBuat.kategori_id || !formBuat.kronologi || !formBuat.lokasi_kejadian) {
      setMessageBuat({ type: 'error', text: 'Mohon isi semua field yang wajib' });
      return;
    }

    try {
      setLoading(true);
      
      // Generate kode tiket
      const kodeTiket = `TIKET-${Date.now()}`;

      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .insert([{
          kode_tiket: kodeTiket,
          status_pelapor: formBuat.status_pelapor,
          nama_pelapor: formBuat.nama_pelapor || null,
          kontak_pelapor: formBuat.kontak_pelapor,
          kategori_id: parseInt(formBuat.kategori_id),
          kronologi: formBuat.kronologi,
          lokasi_kejadian: formBuat.lokasi_kejadian,
          bukti_foto: formBuat.bukti_foto || null,
          status_kasus: 'Pending'
        }])
        .select();

      if (error) throw error;

      setMessageBuat({ 
        type: 'success', 
        text: `Lapor berhasil dibuat! Kode Tiket: ${kodeTiket}` 
      });
      
      // Reset form
      setFormBuat({
        status_pelapor: 'Korban',
        nama_pelapor: '',
        kontak_pelapor: '',
        kategori_id: '',
        kronologi: '',
        lokasi_kejadian: '',
        bukti_foto: '',
        usia: '',
        hubungan_korban: ''
      });
      setCurrentStep(1);

      // Auto scroll ke message
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 500);
    } catch (err) {
      console.error('Error:', err);
      setMessageBuat({ type: 'error', text: `Gagal: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Cek status laporan
  const handleCekStatus = async () => {
    if (!searchTiket.trim()) {
      alert('Silakan masukkan kode tiket');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laporan_pengaduan')
        .select('*, m_kategori_kasus(nama_kategori, kelompok)')
        .eq('kode_tiket', searchTiket.toUpperCase())
        .single();

      if (error) {
        setStatusLaporan(null);
        alert('Tiket tidak ditemukan');
        return;
      }

      setStatusLaporan(data);
    } catch (err) {
      console.error('Error:', err);
      setStatusLaporan(null);
      alert('Terjadi kesalahan saat mencari tiket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Circle className="w-6 h-6 text-yellow-500 fill-yellow-100" />;
      case 'Proses': return <AlertCircle className="w-6 h-6 text-blue-500" />;
      case 'Selesai': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      default: return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'Pending': return 'Menunggu Proses';
      case 'Proses': return 'Sedang Diproses';
      case 'Selesai': return 'Selesai';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Proses': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Selesai': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysDifference = (createdAt, finishedAt) => {
    if (!finishedAt) return '-';
    const created = new Date(createdAt);
    const finished = new Date(finishedAt);
    const days = Math.ceil((finished - created) / (1000 * 60 * 60 * 24));
    return `${days} hari`;
  };

  return (
    <div className="min-h-screen pt-36 pb-12 px-6" style={{
      background: 'linear-gradient(135deg, #ede8f5 0%, #e8d5f2 20%, #f5f0fa 40%, #e8d5f2 60%, #ede8f5 80%, #e8d5f2 100%)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-3">Portal Layanan Pengaduan</h1>
          <p className="text-lg text-body">Layanan pengaduan resmi untuk perempuan dan anak Indonesia</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          <button
            onClick={() => {
              setActiveTab('buat');
              setCurrentStep(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm ${
              activeTab === 'buat'
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-heading border-2 border-primary/20 hover:border-primary'
            }`}
          >
            <FileText className="w-5 h-5" />
            Buat Laporan Baru
          </button>
          <button
            onClick={() => setActiveTab('cek')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm ${
              activeTab === 'cek'
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-heading border-2 border-primary/20 hover:border-primary'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Cek Status Laporan
          </button>
        </div>

        {/* TAB 1: BUAT LAPOR - MULTI STEP */}
        {activeTab === 'buat' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-primary to-secondary p-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                        currentStep >= step
                          ? 'bg-white text-primary'
                          : 'bg-white/30 text-white'
                      }`}
                    >
                      {currentStep > step ? <CheckCircle2 className="w-6 h-6" /> : step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          currentStep > step ? 'bg-white' : 'bg-white/30'
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between text-white text-sm">
                <span className={currentStep >= 1 ? 'font-semibold' : 'opacity-70'}>Identitas Pelapor</span>
                <span className={currentStep >= 2 ? 'font-semibold' : 'opacity-70'}>Detail Kejadian</span>
                <span className={currentStep >= 3 ? 'font-semibold' : 'opacity-70'}>Bukti & Konfirmasi</span>
              </div>
            </div>

            {/* Success/Error Message */}
            {messageBuat.text && (
              <div className={`m-6 p-4 rounded-lg ${
                messageBuat.type === 'success' 
                  ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
                  : 'bg-red-50 text-red-700 border-l-4 border-red-500'
              }`}>
                <p className="font-semibold">{messageBuat.type === 'success' ? '✓ Sukses!' : '✗ Terjadi Kesalahan'}</p>
                <p className="text-sm mt-1">{messageBuat.text}</p>
              </div>
            )}

            <form onSubmit={handleBuatLapor} className="p-8">
              {/* STEP 1: IDENTITAS PELAPOR */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-heading mb-6">Identitas Pelapor</h3>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Status Pelapor *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Korban', 'Saksi'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormBuat(prev => ({ ...prev, status_pelapor: status }))}
                          className={`p-3 rounded-lg border-2 transition font-semibold ${
                            formBuat.status_pelapor === status
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-heading hover:border-primary'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Nama Pelapor (Opsional)</label>
                    <input
                      type="text"
                      name="nama_pelapor"
                      value={formBuat.nama_pelapor}
                      onChange={handleFormChange}
                      placeholder="Biarkan kosong jika ingin tetap anonim"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-600 mt-1">💡 Data Anda dijaga dengan privasi tinggi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">No. WhatsApp *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="kontak_pelapor"
                        value={formBuat.kontak_pelapor}
                        onChange={handleFormChange}
                        placeholder="628xxxxxxxxxx"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">💡 Akan digunakan untuk follow-up hasil pemeriksaan</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-heading mb-2">Usia (Opsional)</label>
                      <input
                        type="number"
                        name="usia"
                        value={formBuat.usia}
                        onChange={handleFormChange}
                        placeholder="Tahun"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-heading mb-2">Hubungan dengan Korban</label>
                      <select
                        name="hubungan_korban"
                        value={formBuat.hubungan_korban}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Pilih --</option>
                        <option value="Korban Langsung">Korban Langsung</option>
                        <option value="Keluarga">Keluarga</option>
                        <option value="Pekerja Sosial">Pekerja Sosial</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DETAIL KEJADIAN */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-heading mb-6">Detail Kejadian</h3>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Kategori Kasus *</label>
                    <select
                      name="kategori_id"
                      value={formBuat.kategori_id}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          [{cat.kelompok}] {cat.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Kronologi Kejadian *</label>
                    <textarea
                      name="kronologi"
                      value={formBuat.kronologi}
                      onChange={handleFormChange}
                      placeholder="Jelaskan detail kejadian: apa, kapan, di mana, dan siapa yang terlibat..."
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    ></textarea>
                    <p className="text-xs text-gray-600 mt-1">💡 Semakin detail informasi, semakin baik untuk penanganan</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Lokasi Kejadian *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="lokasi_kejadian"
                        value={formBuat.lokasi_kejadian}
                        onChange={handleFormChange}
                        placeholder="Desa/Kelurahan, Kecamatan, Kabupaten"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BUKTI & KONFIRMASI */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-heading mb-6">Bukti & Konfirmasi</h3>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800"><strong>ℹ️ Catatan:</strong> Upload bukti (foto/dokumen) membantu penanganan kasus lebih cepat</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Link Bukti Foto/Dokumen (Opsional)</label>
                    <input
                      type="url"
                      name="bukti_foto"
                      value={formBuat.bukti_foto}
                      onChange={handleFormChange}
                      placeholder="https://example.com/bukti.jpg atau link Google Drive/OneDrive"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-600 mt-1">💡 Bisa berupa link dari Google Drive, OneDrive, atau cloud storage lainnya</p>
                  </div>

                  {/* Preview Data */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-bold text-heading mb-4">Preview Data Laporan:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Status</span>
                        <span className="font-semibold">{formBuat.status_pelapor}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Nama</span>
                        <span className="font-semibold">{formBuat.nama_pelapor || '(Anonim)'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Kategori</span>
                        <span className="font-semibold">{categories.find(c => c.id === parseInt(formBuat.kategori_id))?.nama_kategori}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Lokasi</span>
                        <span className="font-semibold">{formBuat.lokasi_kejadian}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <input
                      type="checkbox"
                      id="konfirmasi"
                      className="mt-1 w-5 h-5 text-primary rounded"
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setMessageBuat({ type: 'error', text: 'Anda harus menyetujui pengiriman laporan' });
                        } else {
                          setMessageBuat({ type: '', text: '' });
                        }
                      }}
                    />
                    <label htmlFor="konfirmasi" className="text-sm text-yellow-900">
                      <strong>Saya menyetujui pengiriman laporan ini</strong> dan memahami bahwa data saya akan diproses sesuai dengan privasi yang berlaku
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-heading hover:bg-gray-300'
                  }`}
                  disabled={currentStep === 1}
                >
                  ← Kembali
                </button>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 btn-primary py-3 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2"
                  >
                    Lanjut <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-3 rounded-lg text-white font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Mengirim...' : '✓ Kirim Laporan'}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: CEK STATUS */}
        {activeTab === 'cek' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="space-y-8">
              {/* Search Box */}
              <div>
                <h3 className="text-xl font-bold text-heading mb-4">Cari Status Laporan Anda</h3>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTiket}
                      onChange={(e) => setSearchTiket(e.target.value.toUpperCase())}
                      placeholder="Masukkan kode tiket (cth: TIKET-1234567890)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => e.key === 'Enter' && handleCekStatus()}
                    />
                  </div>
                  <button
                    onClick={handleCekStatus}
                    disabled={loading}
                    className="btn-primary px-8 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Mencari...' : 'Cek'}
                  </button>
                </div>
                <p className="text-xs text-gray-600">💡 Kode tiket diberikan saat Anda membuat laporan baru</p>
              </div>

              {/* Hasil Pencarian */}
              {statusLaporan && (
                <div className="border-l-4 border-primary rounded-lg overflow-hidden">
                  {/* Status Header */}
                  <div className={`${getStatusColor(statusLaporan.status_kasus)} border-b p-6`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(statusLaporan.status_kasus)}
                        <div>
                          <h3 className="text-2xl font-bold">
                            {getStatusLabel(statusLaporan.status_kasus)}
                          </h3>
                          <p className="text-sm opacity-75 mt-1">{statusLaporan.kode_tiket}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-black/10 rounded-lg transition" title="Share">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-black/10 rounded-lg transition" title="Download">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="p-6 bg-gray-50">
                    <h4 className="font-bold text-heading mb-6">Timeline Penanganan</h4>
                    <div className="space-y-4">
                      {/* Timeline Item 1: Pending */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <Circle className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <div className="w-0.5 h-12 bg-yellow-200"></div>
                        </div>
                        <div className="pb-4">
                          <p className="font-semibold text-heading">Laporan Diterima</p>
                          <p className="text-sm text-gray-600">{formatDate(statusLaporan.created_at)}</p>
                        </div>
                      </div>

                      {/* Timeline Item 2: Proses */}
                      {statusLaporan.status_kasus === 'Proses' || statusLaporan.status_kasus === 'Selesai' ? (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <Circle className="w-5 h-5 fill-blue-400 text-blue-400" />
                            {statusLaporan.status_kasus === 'Selesai' && <div className="w-0.5 h-12 bg-blue-200"></div>}
                          </div>
                          <div className="pb-4">
                            <p className="font-semibold text-heading">Sedang Diproses</p>
                            <p className="text-sm text-gray-600">Tim kami sedang menangani laporan Anda</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 opacity-50">
                          <div className="flex flex-col items-center">
                            <Circle className="w-5 h-5 fill-gray-300 text-gray-300" />
                            <div className="w-0.5 h-12 bg-gray-200"></div>
                          </div>
                          <div className="pb-4">
                            <p className="font-semibold text-heading">Sedang Diproses</p>
                            <p className="text-sm text-gray-600">Menunggu...</p>
                          </div>
                        </div>
                      )}

                      {/* Timeline Item 3: Selesai */}
                      {statusLaporan.status_kasus === 'Selesai' ? (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="w-5 h-5 fill-green-400 text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-heading">Selesai Diproses</p>
                            <p className="text-sm text-gray-600">{formatDate(statusLaporan.tanggal_selesai)}</p>
                            <p className="text-sm text-gray-600 mt-1">Waktu penyelesaian: {getDaysDifference(statusLaporan.created_at, statusLaporan.tanggal_selesai)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 opacity-50">
                          <div className="flex flex-col items-center">
                            <Circle className="w-5 h-5 fill-gray-300 text-gray-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-heading">Selesai Diproses</p>
                            <p className="text-sm text-gray-600">Menunggu hasil akhir...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-bold text-heading mb-4">Informasi Laporan</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Kategori Kasus</p>
                          <p className="text-heading font-semibold">{statusLaporan.m_kategori_kasus?.nama_kategori}</p>
                          <p className="text-xs text-gray-600">{statusLaporan.m_kategori_kasus?.kelompok}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Jenis Pelapor</p>
                          <p className="text-heading font-semibold">{statusLaporan.status_pelapor}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase">Identitas Pelapor</p>
                            <button
                              type="button"
                              onClick={() => setShowIdentity(!showIdentity)}
                              className="text-primary hover:text-secondary"
                            >
                              {showIdentity ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-heading font-semibold">
                            {showIdentity ? statusLaporan.nama_pelapor || '(Anonim)' : '••••••'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Tanggal Lapor</p>
                          <p className="text-heading font-semibold">{formatDate(statusLaporan.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-heading mb-3">Lokasi Kejadian</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-heading font-semibold">{statusLaporan.lokasi_kejadian}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-heading mb-3">Kronologi Kejadian</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-heading text-sm whitespace-pre-wrap">{statusLaporan.kronologi}</p>
                      </div>
                    </div>

                    {statusLaporan.catatan_admin && (
                      <div>
                        <h4 className="font-bold text-heading mb-3">Catatan Dari Tim</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-heading text-sm">{statusLaporan.catatan_admin}</p>
                        </div>
                      </div>
                    )}

                    {statusLaporan.bukti_foto && (
                      <div>
                        <h4 className="font-bold text-heading mb-3">Bukti</h4>
                        <a href={statusLaporan.bukti_foto} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-semibold">
                          <Download className="w-4 h-4" />
                          Lihat Bukti
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
