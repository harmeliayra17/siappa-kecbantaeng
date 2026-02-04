import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { agendaService } from '../../../services/dataService';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AgendaList() {
  const navigate = useNavigate();
  const { profile, isSuperAdmin } = useAuth();
  const [agenda, setAgenda] = useState([]);
  const [filteredAgenda, setFilteredAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAgenda();
  }, []);

  const fetchAgenda = async () => {
    try {
      setLoading(true);
      const result = await agendaService.getAllAgenda();
      if (result?.success) {
        setAgenda(result.data || []);
        setFilteredAgenda(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = agenda;

    if (searchTerm) {
      filtered = filtered.filter(
        a =>
          a.judul_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.lokasi_kegiatan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgenda(filtered);
  }, [searchTerm, agenda]);

  const handleDelete = async (id) => {
    try {
      const result = await agendaService.deleteAgenda(id);
      if (result?.success) {
        setAgenda(agenda.filter(a => a.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Error deleting agenda:', err);
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
        <div>
          <h1 className="text-4xl font-bold text-heading">Kelola Kegiatan</h1>
          <p className="text-body mt-1">Manajemen agenda dan kegiatan</p>
        </div>
        <Link
          to="/admin/cms/agenda/tambah"
          className="inline-flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-lg hover:shadow-lg transition font-semibold"
        >
          <Plus size={20} />
          Tambah Kegiatan
        </Link>
      </div>

      {/* Search */}
      <div className="card-clean p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted" size={20} />
          <input
            type="text"
            placeholder="Cari judul kegiatan atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-mediumGray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card-clean overflow-hidden">
        {filteredAgenda.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-mediumGray">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Judul</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-subheading uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mediumGray">
                {filteredAgenda.map(a => (
                  <tr key={a.id} className="hover:bg-surface transition">
                    <td className="px-6 py-4 font-semibold text-heading">{a.judul_kegiatan}</td>
                    <td className="px-6 py-4 text-sm text-body">
                      {new Date(a.tanggal_mulai).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-body">{a.lokasi_kegiatan}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        a.status === 'Akan Datang' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'Sedang Berlangsung' ? 'bg-green-100 text-green-800' :
                        'bg-mediumGray text-darkGray'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/cms/agenda/edit/${a.id}`}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition font-medium"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(a.id)}
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
          <div className="p-12 text-center text-muted">
            <p className="text-sm font-medium">Tidak ada kegiatan ditemukan</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-clean p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-heading mb-4">Hapus Kegiatan?</h3>
            <p className="text-body mb-6 text-sm">Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.</p>
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
