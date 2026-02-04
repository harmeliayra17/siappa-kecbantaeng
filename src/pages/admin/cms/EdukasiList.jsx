import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { edukasiService } from '../../../services/dataService';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function EdukasiList() {
  const { isSuperAdmin } = useAuth();
  const [edukasi, setEdukasi] = useState([]);
  const [filteredEdukasi, setFilteredEdukasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!isSuperAdmin()) {
      // Satgas tidak bisa akses halaman ini
      return;
    }
    fetchEdukasi();
  }, [isSuperAdmin]);

  const fetchEdukasi = async () => {
    try {
      setLoading(true);
      const result = await edukasiService.getAllEdukasi();
      if (result?.success) {
        setEdukasi(result.data || []);
        setFilteredEdukasi(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching edukasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = edukasi;

    if (searchTerm) {
      filtered = filtered.filter(
        e =>
          e.judul_konten.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.penulis.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEdukasi(filtered);
  }, [searchTerm, edukasi]);

  const handleDelete = async (id) => {
    try {
      const result = await edukasiService.deleteEdukasi(id);
      if (result?.success) {
        setEdukasi(edukasi.filter(e => e.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Error deleting edukasi:', err);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Kelola Konten Edukasi</h1>
        <Link
          to="/admin/cms/edukasi/tambah"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold"
        >
          <Plus size={20} />
          Tambah Konten
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari judul atau penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredEdukasi.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Penulis</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEdukasi.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{e.judul_konten || e.judul_artikel}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{e.penulis}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{e.kategori?.nama_kategori || e.kategori || e.kategori_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(e.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/cms/edukasi/edit/${e.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(e.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
          <div className="p-12 text-center text-gray-500">
            <p>Tidak ada konten edukasi ditemukan</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hapus Konten?</h3>
            <p className="text-gray-600 mb-6">Anda yakin ingin menghapus konten edukasi ini?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
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
