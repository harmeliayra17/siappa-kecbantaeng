import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { kasusService, masterService } from '../../../services/dataService';
import { ArrowLeft, Save, Download, Phone, User, MapPin, Calendar, FileText } from 'lucide-react';

export default function DetailKasus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [kasus, setKasus] = useState(null);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    status: '',
    instansi_rujukan: '',
    catatan_admin: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kasusResult, kategoriResult] = await Promise.all([
        kasusService.getKasusById(id),
        masterService.getKategoriKasus(),
      ]);

      if (kasusResult?.success) {
        const data = kasusResult.data;
        setKasus(data);

        // ✅ FIX: Mapping data dari database ke form state yang benar
        setFormData({
          status: data.status_kasus || 'Pending', // Pakai status_kasus dari DB
          instansi_rujukan: data.instansi_rujukan || '',
          catatan_admin: data.catatan_admin || '',
        });
      }

      if (kategoriResult?.success) {
        setKategoris(kategoriResult.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
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
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }
    if (formData.status === 'Sedang Dirujuk' && !formData.instansi_rujukan) {
      newErrors.instansi_rujukan = 'Instansi rujukan harus diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      // ✅ FIX: Update menggunakan nama kolom database yang benar (status_kasus)
      const result = await kasusService.updateKasus(id, {
        status_kasus: formData.status, 
        instansi_rujukan: formData.instansi_rujukan,
        catatan_admin: formData.catatan_admin,
        updated_at: new Date().toISOString(),
      });

      if (result?.success) {
        alert('Kasus berhasil diperbarui');
        // Refresh data tanpa reload page agar status terupdate di UI
        fetchData(); 
      } else {
        alert('Gagal memperbarui kasus');
      }
    } catch (err) {
      console.error('Error updating kasus:', err);
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

  if (!kasus) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Kasus tidak ditemukan</p>
        <button
          onClick={() => navigate('/admin/kasus/list')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const isRujuk = formData.status === 'Sedang Dirujuk';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/kasus/list')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Kasus</h1>
            <div className="flex items-center gap-2 mt-1">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-600 border border-gray-200">
                    {kasus.kode_tiket}
                </span>
                <span className="text-sm text-gray-500">
                    • Dilaporkan pada {new Date(kasus.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </span>
            </div>
          </div>
        </div>

        {/* ✅ TAMBAHAN: Tombol WhatsApp */}
        {kasus.kontak_pelapor && (
            <a 
              href={`https://wa.me/${kasus.kontak_pelapor.replace(/^0/, '62').replace(/\D/g,'')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-medium"
            >
                <Phone size={18} />
                Hubungi via WhatsApp
            </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: STATUS & DATA PELAPOR */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Card (Dipindah ke kiri atas agar mudah diakses) */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary">
            <h3 className="font-bold text-gray-900 mb-3">Status Saat Ini</h3>
            <div className={`px-4 py-3 rounded-lg text-center font-bold text-lg ${
              kasus.status_kasus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              kasus.status_kasus === 'Proses' ? 'bg-blue-100 text-blue-800' :
              kasus.status_kasus === 'Selesai' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {kasus.status_kasus || 'Pending'}
            </div>
          </div>

          {/* ✅ PERBAIKAN: Informasi Pelapor (Data Diri Lengkap) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-primary"/> Data Pelapor
            </h2>
            <div className="space-y-4 divide-y divide-gray-100">
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Pelapor</label>
                <p className="text-gray-900 font-medium text-lg">{kasus.nama_pelapor || '(Anonim)'}</p>
              </div>
              
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status Pelapor</label>
                <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm font-medium text-gray-700">
                    {kasus.status_pelapor}
                </span>
              </div>

              {kasus.hubungan_korban && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hubungan dgn Korban</label>
                    <p className="text-gray-900">{kasus.hubungan_korban}</p>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Usia</label>
                  <p className="text-gray-900">{kasus.usia ? `${kasus.usia} Tahun` : '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kontak</label>
                  <p className="text-gray-900 font-mono text-sm">{kasus.kontak_pelapor}</p>
                </div>
              </div>
              
              <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Desa Domisili</label>
                  <p className="text-gray-900 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400"/> {kasus.desa_pelapor || '-'}
                  </p>
              </div>
            </div>
          </div>

          {/* Form Update Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tindak Lanjut</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Update Status <span className="text-red-600">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Pending">Pending (Menunggu)</option>
                  <option value="Proses">Sedang Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
                {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
              </div>

              {/* Catatan Admin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Petugas</label>
                <textarea
                  name="catatan_admin"
                  value={formData.catatan_admin}
                  onChange={handleInputChange}
                  placeholder="Tulis kronologi penanganan atau alasan penolakan..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: DETAIL KEJADIAN & BUKTI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Informasi Kejadian */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b">
                <FileText size={20} className="text-primary"/> Rincian Kejadian
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
               <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kategori Kasus</label>
                  <p className="font-bold text-gray-900 text-lg">{kasus.m_kategori_kasus?.nama_kategori || '-'}</p>
                  <p className="text-sm text-gray-600">{kasus.m_kategori_kasus?.kelompok}</p>
               </div>
               
               <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lokasi Kejadian</label>
                  <p className="font-bold text-gray-900 text-lg flex items-start gap-2">
                      <MapPin size={18} className="text-red-500 mt-1 flex-shrink-0"/>
                      {kasus.lokasi_kejadian}
                  </p>
               </div>

               <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Kejadian</label>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                      <Calendar size={18} className="text-primary"/>
                      {/* Fallback ke created_at jika tanggal_kejadian kosong */}
                      {new Date(kasus.tanggal_kejadian || kasus.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                  </p>
               </div>

               <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Waktu</label>
                  <p className="font-bold text-gray-900">{kasus.waktu_kejadian || '-'}</p>
               </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">Kronologi Lengkap</label>
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 min-h-[120px]">
                 <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {kasus.kronologi || 'Tidak ada kronologi yang disertakan.'}
                 </p>
              </div>
            </div>

            {/* ✅ TAMBAHAN: Bagian Bukti Foto */}
            <div>
               <label className="block text-sm font-bold text-gray-900 mb-3">Bukti Pendukung</label>
               {kasus.bukti_foto ? (
                 <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <FileText size={24}/>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-blue-900">Lampiran Bukti</p>
                        <p className="text-xs text-blue-700">Klik tombol di samping untuk melihat bukti.</p>
                    </div>
                    <a 
                      href={kasus.bukti_foto} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition shadow-sm text-sm font-semibold"
                    >
                       <Download size={16} />
                       Lihat Bukti
                    </a>
                 </div>
               ) : (
                 <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">Tidak ada bukti foto/dokumen yang dilampirkan pelapor.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}