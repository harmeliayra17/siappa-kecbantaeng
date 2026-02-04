import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { kasusService, masterService } from '../../../services/dataService';
import { ArrowLeft, Save } from 'lucide-react';

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
        setKasus(kasusResult.data);
        setFormData({
          status: kasusResult.data.status || '',
          instansi_rujukan: kasusResult.data.instansi_rujukan || '',
          catatan_admin: kasusResult.data.catatan_admin || '',
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
      const result = await kasusService.updateKasus(id, {
        status: formData.status,
        instansi_rujukan: formData.instansi_rujukan,
        catatan_admin: formData.catatan_admin,
        updated_at: new Date().toISOString(),
      });

      if (result?.success) {
        alert('Kasus berhasil diperbarui');
        navigate('/admin/kasus/list');
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
    <div className="space-y-6 max-w-7xl mx-auto px-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/kasus/list')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detail Kasus</h1>
          <p className="text-gray-600 mt-1">{kasus.kode_tiket}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Korban */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Korban</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Korban</label>
                <p className="text-gray-900 font-medium">{kasus.nama_korban}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Umur</label>
                  <p className="text-gray-900">{kasus.umur_korban} tahun</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
                  <p className="text-gray-900">{kasus.jenis_kelamin_korban}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Kejadian */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Kejadian</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori Kasus</label>
                <p className="text-gray-900 font-medium">{kasus.kategori?.nama_kategori}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi Kejadian</label>
                <p className="text-gray-900">{kasus.lokasi_kejadian}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian</label>
                  <p className="text-gray-900">
                    {new Date(kasus.tanggal_kejadian).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Waktu Kejadian</label>
                  <p className="text-gray-900">{kasus.waktu_kejadian}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Kejadian</label>
                <p className="text-gray-900 whitespace-pre-wrap">{kasus.deskripsi_kejadian}</p>
              </div>
            </div>
          </div>

          {/* Update Status Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih Status</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Sedang Ditangani">Sedang Ditangani</option>
                  <option value="Sedang Dirujuk">Sedang Dirujuk</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
                {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
              </div>

              {/* Instansi Rujukan - CONDITIONAL */}
              {isRujuk && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instansi Rujukan <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="instansi_rujukan"
                    value={formData.instansi_rujukan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Rumah Sakit, Polda, dll"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.instansi_rujukan ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.instansi_rujukan && (
                    <p className="text-red-600 text-sm mt-1">{errors.instansi_rujukan}</p>
                  )}
                </div>
              )}

              {/* Catatan Admin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Admin</label>
                <textarea
                  name="catatan_admin"
                  value={formData.catatan_admin}
                  onChange={handleInputChange}
                  placeholder="Tulis catatan atau tindak lanjut..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/kasus/list')}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-3">Status Saat Ini</h3>
            <div className={`px-4 py-3 rounded-lg text-center font-semibold ${
              kasus.status === 'Menunggu Verifikasi' ? 'bg-yellow-100 text-yellow-800' :
              kasus.status === 'Sedang Ditangani' ? 'bg-blue-100 text-blue-800' :
              kasus.status === 'Sedang Dirujuk' ? 'bg-purple-100 text-purple-800' :
              kasus.status === 'Selesai' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {kasus.status}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Kode Tiket</p>
              <p className="text-gray-900 font-mono font-semibold">{kasus.kode_tiket}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Desa Pelapor</p>
              <p className="text-gray-900">{kasus.desa_pelapor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Tanggal Lapor</p>
              <p className="text-gray-900">{new Date(kasus.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Nama Pelapor</p>
              <p className="text-gray-900">{kasus.nama_pelapor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
