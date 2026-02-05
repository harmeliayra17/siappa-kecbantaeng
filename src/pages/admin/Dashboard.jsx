import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { kasusService, agendaService } from '../../services/dataService';
import { 
  FileText, Calendar, AlertCircle, 
  CheckCircle, Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { profile, isSuperAdmin, isSatgas } = useAuth();
  
  // State Statistik
  const [stats, setStats] = useState({
    totalKasus: 0,
    kasusMenunggu: 0,
    kasusDiproses: 0,
    kasusSelesai: 0,
    totalAgenda: 0,
  });
  
  const [recentKasus, setRecentKasus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Tentukan mau ambil semua kasus (Admin) atau per desa (Satgas)
        const kasusPromise = isSuperAdmin() 
          ? kasusService.getAllKasus() 
          : kasusService.getKasusByDesa(profile?.desa_tugas);

        // 2. Ambil data Agenda juga (buat hitung total)
        const agendaPromise = agendaService.getAllAgenda();

        // Jalankan keduanya barengan (Parallel)
        const [kasusResult, agendaResult] = await Promise.all([kasusPromise, agendaPromise]);

        // 3. Olah Data Kasus
        if (kasusResult?.success) {
          const dataKasus = kasusResult.data || [];
          
          setStats(prev => ({
            ...prev,
            totalKasus: dataKasus.length,
            // ✅ FIX: Filter pakai 'status_kasus' dan value 'Pending'/'Proses'/'Selesai'
            kasusMenunggu: dataKasus.filter(k => k.status_kasus === 'Pending').length,
            kasusDiproses: dataKasus.filter(k => k.status_kasus === 'Proses' || k.status_kasus === 'Sedang Ditangani').length,
            kasusSelesai: dataKasus.filter(k => k.status_kasus === 'Selesai').length,
          }));

          setRecentKasus(dataKasus.slice(0, 5)); // Ambil 5 terbaru
        }

        // 4. Olah Data Agenda
        if (agendaResult?.success) {
          setStats(prev => ({
            ...prev,
            totalAgenda: agendaResult.data?.length || 0
          }));
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Terjadi kesalahan saat memuat dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchDashboardData();
    }
  }, [profile, isSuperAdmin, isSatgas]);

  // Komponen Kartu Statistik
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card-clean p-6 hover-lift h-full bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg flex-shrink-0 ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  // Helper untuk Warna Badge Status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Proses': return 'bg-blue-100 text-blue-800';
      case 'Sedang Ditangani': return 'bg-blue-100 text-blue-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Ditolak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 pb-12">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Selamat datang, <strong>{profile?.nama_lengkap}</strong>
          {isSuperAdmin() ? ' (Admin Kecamatan)' : ` (Satgas ${profile?.desa_tugas})`}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={FileText}
          label="Total Laporan"
          value={stats.totalKasus}
          color="bg-blue-500"
        />
        <StatCard
          icon={AlertCircle}
          label="Menunggu Verifikasi"
          value={stats.kasusMenunggu}
          color="bg-yellow-500"
        />
        <StatCard
          icon={Clock}
          label="Sedang Diproses"
          value={stats.kasusDiproses}
          color="bg-orange-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Selesai"
          value={stats.kasusSelesai}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          label="Total Kegiatan"
          value={stats.totalAgenda}
          color="bg-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Kasus */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Laporan Terbaru</h2>
            <Link
              to="/admin/kasus/list"
              className="text-primary hover:text-blue-700 text-sm font-semibold transition"
            >
              Lihat Semua →
            </Link>
          </div>

          {recentKasus.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentKasus.map(kasus => (
                <div key={kasus.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          {kasus.kode_tiket}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(kasus.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900">{kasus.kategori?.nama_kategori || 'Tanpa Kategori'}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">📍 {kasus.lokasi_kejadian}</p>
                    </div>
                    
                    {/* ✅ FIX: Badge Status pakai status_kasus */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(kasus.status_kasus)}`}>
                      {kasus.status_kasus || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p className="text-sm">Belum ada laporan masuk.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <Link
                to="/admin/kasus/list"
                className="block w-full py-3 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold hover:bg-blue-100 transition"
              >
                Kelola Laporan Masuk
              </Link>
              <Link
                to="/admin/cms/agenda"
                className="block w-full py-3 bg-purple-50 text-purple-700 rounded-lg text-center font-semibold hover:bg-purple-100 transition"
              >
                Update Agenda Kegiatan
              </Link>
              {isSuperAdmin() && (
                <Link
                  to="/admin/cms/edukasi"
                  className="block w-full py-3 bg-pink-50 text-pink-700 rounded-lg text-center font-semibold hover:bg-pink-100 transition"
                >
                  Tulis Artikel Edukasi
                </Link>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              💡 <strong>Tips Admin:</strong> Pastikan selalu memverifikasi bukti foto sebelum mengubah status laporan menjadi "Proses".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}