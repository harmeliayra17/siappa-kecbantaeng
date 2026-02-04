import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { kasusService } from '../../../services/dataService';
import { Search, Filter, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

export default function ListKasus() {
  const { profile, isSuperAdmin, isSatgas } = useAuth();
  const [kasus, setKasus] = useState([]);
  const [filteredKasus, setFilteredKasus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchKasus();
  }, []);

  const fetchKasus = async () => {
    try {
      setLoading(true);
      let result;
      if (isSuperAdmin()) {
        result = await kasusService.getAllKasus();
      } else if (isSatgas()) {
        result = await kasusService.getKasusByDesa(profile?.desa_tugas);
      }

      if (result?.success) {
        setKasus(result.data || []);
        setFilteredKasus(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching kasus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = kasus;

    if (searchTerm) {
      filtered = filtered.filter(
        k =>
          k.kode_tiket.toLowerCase().includes(searchTerm.toLowerCase()) ||
          k.nama_korban.toLowerCase().includes(searchTerm.toLowerCase()) ||
          k.lokasi_kejadian.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(k => k.status === statusFilter);
    }

    setFilteredKasus(filtered);
  }, [searchTerm, statusFilter, kasus]);

  const handleDelete = async (id) => {
    try {
      const result = await kasusService.deleteKasus(id);
      if (result?.success) {
        setKasus(kasus.filter(k => k.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Error deleting kasus:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Menunggu Verifikasi': 'bg-yellow-100 text-yellow-800',
      'Sedang Ditangani': 'bg-blue-100 text-blue-800',
      'Sedang Dirujuk': 'bg-purple-100 text-purple-800',
      'Selesai': 'bg-green-100 text-green-800',
      'Ditolak': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-heading">Manajemen Laporan Kasus</h1>
          <p className="text-body mt-1">Kelola dan pantau semua laporan pengaduan</p>
        </div>
        <Link
          to="/admin/kasus/tambah"
          className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-lg hover:shadow-lg transition font-semibold"
        >
          <Plus size={20} />
          Tambah Kasus
        </Link>
      </div>

      {/* Filters */}
      <div className="card-clean p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted" size={20} />
            <input
              type="text"
              placeholder="Cari kode tiket, nama korban, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-mediumGray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center gap-2">
            <Filter size={20} className="text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-mediumGray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Sedang Ditangani">Sedang Ditangani</option>
              <option value="Sedang Dirujuk">Sedang Dirujuk</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          {/* Result Counter */}
          <div className="flex items-center justify-end px-4 py-2 bg-surface rounded-lg border border-mediumGray">
            <p className="text-sm text-body font-medium">
              <strong>{filteredKasus.length}</strong> dari <strong>{kasus.length}</strong> kasus
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-clean overflow-hidden">
        {filteredKasus.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-mediumGray">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Kode Tiket</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Nama Korban</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mediumGray">
                {filteredKasus.map(k => (
                  <tr key={k.id} className="hover:bg-surface transition">
                    <td className="px-6 py-4 font-semibold text-heading">{k.kode_tiket}</td>
                    <td className="px-6 py-4 text-body">{k.nama_korban}</td>
                    <td className="px-6 py-4 text-sm text-body">{k.kategori?.nama_kategori}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(k.status)}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-body">
                      {new Date(k.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/kasus/${k.id}`}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition font-medium"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(k.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted">
            <p className="text-sm font-medium">Tidak ada kasus yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-clean p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-heading mb-4">Hapus Kasus?</h3>
            <p className="text-body mb-6 text-sm">
              Anda yakin ingin menghapus kasus ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 btn-secondary rounded-lg hover:shadow-md transition font-semibold text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
