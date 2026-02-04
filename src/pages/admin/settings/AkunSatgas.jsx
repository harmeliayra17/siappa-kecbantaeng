import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { kasusService } from '../../../services/dataService';
import { Search, Plus, Edit2, Trash2, Shield } from 'lucide-react';

export default function AkunSatgas() {
  const { isSuperAdmin, profile } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newAccount, setNewAccount] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    role: 'satgas',
    desa_tugas: '',
  });

  useEffect(() => {
    if (!isSuperAdmin()) {
      return;
    }
    fetchAccounts();
  }, [isSuperAdmin]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // Fetch dari profiles table - simplified version
      // Dalam implementasi real, ini akan fetch dari Supabase profiles
      const mockAccounts = [
        { id: 1, nama_lengkap: 'Admin Kecamatan', email: 'admin@kecamatan.com', role: 'kecamatan', desa_tugas: '-' },
        { id: 2, nama_lengkap: 'Satgas Desa A', email: 'satgas.a@desa.com', role: 'satgas', desa_tugas: 'Desa A' },
        { id: 3, nama_lengkap: 'Satgas Desa B', email: 'satgas.b@desa.com', role: 'satgas', desa_tugas: 'Desa B' },
      ];
      setAccounts(mockAccounts);
      setFilteredAccounts(mockAccounts);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(
        a =>
          a.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.desa_tugas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, accounts]);

  const handleDelete = async (id) => {
    try {
      // API call untuk delete account
      setAccounts(accounts.filter(a => a.id !== id));
      setDeleteConfirm(null);
      alert('Akun berhasil dihapus');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Gagal menghapus akun');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      // API call untuk update role
      setAccounts(accounts.map(a => a.id === id ? { ...a, role: newRole } : a));
      setEditingId(null);
      alert('Role berhasil diperbarui');
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Gagal memperbarui role');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    // Validate
    if (!newAccount.nama_lengkap.trim()) {
      setCreateError('Nama lengkap wajib diisi');
      return;
    }
    if (!newAccount.email.trim()) {
      setCreateError('Email wajib diisi');
      return;
    }
    if (!newAccount.password.trim()) {
      setCreateError('Password wajib diisi');
      return;
    }
    if (newAccount.role === 'satgas' && !newAccount.desa_tugas.trim()) {
      setCreateError('Desa tugas wajib diisi untuk role Satgas');
      return;
    }

    try {
      setCreateLoading(true);
      // In real implementation, this should call an API endpoint that:
      // 1. Creates a user in Supabase Auth
      // 2. Creates a profile in the profiles table
      
      // For now, we'll add it to the local state
      const newId = Math.max(...accounts.map(a => a.id), 0) + 1;
      const newAcc = {
        id: newId,
        nama_lengkap: newAccount.nama_lengkap,
        email: newAccount.email,
        role: newAccount.role,
        desa_tugas: newAccount.role === 'satgas' ? newAccount.desa_tugas : '-',
      };
      
      setAccounts([...accounts, newAcc]);
      setShowCreateModal(false);
      setNewAccount({
        nama_lengkap: '',
        email: '',
        password: '',
        role: 'satgas',
        desa_tugas: '',
      });
      alert('Akun berhasil ditambahkan');
    } catch (err) {
      console.error('Error creating account:', err);
      setCreateError(err.message || 'Gagal membuat akun');
    } finally {
      setCreateLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Kelola Akun</h1>
          <p className="text-gray-600 mt-1">Manage admin and satgas accounts</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold">
          <Plus size={20} />
          Tambah Akun
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAccounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Desa Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{account.nama_lengkap}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.email}</td>
                    <td className="px-6 py-4">
                      {editingId === account.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => {
                            handleUpdateRole(account.id, e.target.value);
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="kecamatan">Kecamatan (Admin)</option>
                          <option value="satgas">Satgas (Local Admin)</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          account.role === 'kecamatan' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Shield size={14} />
                          {account.role === 'kecamatan' ? 'Kecamatan' : 'Satgas'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.desa_tugas}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(account.id);
                            setEditRole(account.role);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(account.id)}
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
            <p>Tidak ada akun ditemukan</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hapus Akun?</h3>
            <p className="text-gray-600 mb-6">Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.</p>
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

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tambah Akun Baru</h2>
              
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={newAccount.nama_lengkap}
                    onChange={(e) => setNewAccount({...newAccount, nama_lengkap: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                    placeholder="Masukkan email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                    placeholder="Masukkan password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={newAccount.role}
                    onChange={(e) => setNewAccount({...newAccount, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="kecamatan">Kecamatan (Admin)</option>
                    <option value="satgas">Satgas (Local Admin)</option>
                  </select>
                </div>

                {newAccount.role === 'satgas' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Desa Tugas</label>
                    <input
                      type="text"
                      value={newAccount.desa_tugas}
                      onChange={(e) => setNewAccount({...newAccount, desa_tugas: e.target.value})}
                      placeholder="Masukkan nama desa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-50"
                  >
                    {createLoading ? 'Loading...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
