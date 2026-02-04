import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { kasusService, agendaService } from '../../services/dataService';
import { 
  FileText, Calendar, TrendingUp, AlertCircle, 
  CheckCircle, Clock, Users
} from 'lucide-react';

export default function AdminDashboard() {
  const { profile, isSuperAdmin, isSatgas } = useAuth();
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

        // Fetch kasus data based on role
        let kasusResult;
        if (isSuperAdmin()) {
          kasusResult = await kasusService.getAllKasus();
        } else if (isSatgas()) {
          kasusResult = await kasusService.getKasusByDesa(profile?.desa_tugas);
        }

        // Fetch agenda only once, no await for slower rendering
        agendaService.getAllAgenda().catch(() => {
          // Silently handle agenda error
        });

        if (kasusResult?.success) {
          const kasus = kasusResult.data || [];
          const stats = {
            totalKasus: kasus.length,
            kasusMenunggu: kasus.filter(k => k.status === 'Menunggu Verifikasi').length,
            kasusDiproses: kasus.filter(k => k.status === 'Sedang Ditangani').length,
            kasusSelesai: kasus.filter(k => k.status === 'Selesai').length,
            totalAgenda: 0,
          };
          setStats(stats);
          setRecentKasus(kasus.slice(0, 5));
        } else {
          setError('Gagal memuat data dashboard');
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

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card-clean p-6 hover-lift h-full">
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-body text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-heading mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg flex-shrink-0 ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2">
      {/* Header */}
      <div className="mb-8 pt-16 md:pt-0">
        <h1 className="text-4xl font-bold text-heading mb-2">Dashboard</h1>
        <p className="text-lg text-body">
          Selamat datang, <strong>{profile?.nama_lengkap}</strong>
          {isSuperAdmin() ? ' (Kecamatan)' : ` (${profile?.desa_tugas})`}
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
          label="Kegiatan"
          value={stats.totalAgenda}
          color="bg-primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Kasus */}
        <div className="lg:col-span-2 card-clean">
          <div className="p-6 border-b border-mediumGray flex items-center justify-between">
            <h2 className="text-xl font-bold text-heading">Laporan Terbaru</h2>
            <Link
              to="/admin/kasus/list"
              className="text-primary hover:text-secondary text-sm font-semibold transition"
            >
              Lihat Semua →
            </Link>
          </div>

          {recentKasus.length > 0 ? (
            <div className="divide-y divide-mediumGray">
              {recentKasus.map(kasus => (
                <div key={kasus.id} className="p-6 hover:bg-surface transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-heading">{kasus.kode_tiket}</p>
                      <p className="text-sm text-body mt-1">{kasus.kategori?.nama_kategori}</p>
                      <p className="text-xs text-muted mt-1">📍 {kasus.lokasi_kejadian}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      kasus.status === 'Menunggu Verifikasi' ? 'bg-yellow-100 text-yellow-800' :
                      kasus.status === 'Sedang Ditangani' ? 'bg-blue-100 text-blue-800' :
                      kasus.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      'bg-mediumGray text-darkGray'
                    }`}>
                      {kasus.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted">
              <p className="text-sm">Tidak ada laporan untuk ditampilkan</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card-clean p-6">
            <h3 className="font-bold text-heading mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/kasus/list"
                className="block px-4 py-3 btn-primary rounded-lg text-center font-semibold transition"
              >
                Lihat Semua Kasus
              </Link>
              <Link
                to="/admin/cms/agenda"
                className="block px-4 py-3 btn-secondary rounded-lg text-center font-semibold transition"
              >
                Kelola Agenda
              </Link>
              {isSuperAdmin() && (
                <Link
                  to="/admin/cms/edukasi"
                  className="block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-center"
                >
                  Kelola Edukasi
                </Link>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800 font-medium">
              💡 Tip: Gunakan sidebar untuk navigasi atau klik "Lihat Website" untuk preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
