import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../services/supabaseClient'; // Import Supabase langsung
import { Search, Plus, Edit2, Trash2, Shield, AlertCircle } from 'lucide-react';

export default function AkunSatgas() {
  const { isSuperAdmin, profile } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // State untuk Modal Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Form Data
  const [newAccount, setNewAccount] = useState({
    nama_lengkap: '',
    email: '',
    password: '',
    role: 'satgas',
    desa_tugas: '',
    no_hp: '', // Tambahkan no_hp
  });

  useEffect(() => {
    if (!isSuperAdmin()) return;
    fetchAccounts();
  }, [isSuperAdmin]);

  // 1. Fetch Real Data dari Supabase
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
      setFilteredAccounts(data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      alert('Gagal mengambil data akun.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Filter Search
  useEffect(() => {
    let filtered = accounts;
    if (searchTerm) {
      filtered = filtered.filter(
        a =>
          a.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.desa_tugas?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts]);

  // 3. Delete Account (Hapus user dari Auth & Profile)
  const handleDelete = async (id) => {
    try {
      // Hapus dari tabel profiles dulu
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) throw profileError;

      // Note: Menghapus user dari Auth butuh Service Role Key (Backend).
      // Di client-side, kita cuma bisa hapus profile-nya.
      // User Auth akan jadi "orphan" (yatim piatu) tapi tidak bisa login karena profil hilang.
      
      setAccounts(accounts.filter(a => a.id !== id));
      setDeleteConfirm(null);
      alert('Profil akun berhasil dihapus.');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Gagal menghapus akun: ' + err.message);
    }
  };

  // 4. Create Account (Sign Up User Baru)
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    // Validasi Sederhana
    if (!newAccount.nama_lengkap.trim()) return setCreateError('Nama lengkap wajib diisi');
    if (!newAccount.email.trim()) return setCreateError('Email wajib diisi');
    if (!newAccount.password.trim() || newAccount.password.length < 6) return setCreateError('Password minimal 6 karakter');
    if (newAccount.role === 'satgas' && !newAccount.desa_tugas.trim()) return setCreateError('Desa tugas wajib diisi untuk Satgas');

    try {
      setCreateLoading(true);

      // A. Buat User di Auth Supabase
      // Note: Ini akan mengirim email konfirmasi jika setting Supabase 'Enable Email Confirm' nyala.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAccount.email,
        password: newAccount.password,
        options: {
          data: {
            nama_lengkap: newAccount.nama_lengkap,
            role: newAccount.role, // Metadata ini penting buat trigger
          }
        }
      });

      if (authError) throw authError;

      // B. Insert Data Tambahan ke Tabel Profiles (Jika Trigger belum handle)
      // Kalau abang sudah setup Trigger SQL "on_auth_user_created", langkah ini bisa diskip.
      // Tapi untuk aman, kita update manual profilnya.
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            nama_lengkap: newAccount.nama_lengkap,
            role: newAccount.role,
            desa_tugas: newAccount.role === 'satgas' ? newAccount.desa_tugas : null,
            no_hp: newAccount.no_hp
          })
          .eq('id', authData.user.id);

        if (profileError) {
           console.warn("Profile update warning:", profileError);
           // Lanjut aja, karena user auth sudah kebuat
        }
      }

      alert('Akun berhasil dibuat! Silakan cek email untuk verifikasi (jika diaktifkan).');
      setShowCreateModal(false);
      
      // Reset Form
      setNewAccount({
        nama_lengkap: '',
        email: '',
        password: '',
        role: 'satgas',
        desa_tugas: '',
        no_hp: '',
      });

      // Refresh Data
      fetchAccounts();

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
          <p className="text-gray-600 mt-1">Manajemen akun Admin Kecamatan dan Satgas Desa</p>
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
            placeholder="Cari nama, email, atau desa..."
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
                    <td className="px-6 py-4 font-semibold text-gray-900">{account.nama_lengkap || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.email}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          account.role === 'kecamatan' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Shield size={14} />
                          {account.role === 'kecamatan' ? 'Admin Kecamatan' : 'Satgas Desa'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.desa_tugas || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteConfirm(account.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Akun"
                      >
                        <Trash2 size={18} />
                      </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
               <AlertCircle size={24}/>
               <h3 className="text-lg font-bold text-gray-900">Hapus Akun?</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Anda yakin ingin menghapus akun ini? Pengguna tidak akan bisa login lagi.
            </p>
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
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={16}/> {createError}
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={newAccount.nama_lengkap}
                    onChange={(e) => setNewAccount({...newAccount, nama_lengkap: e.target.value})}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                    placeholder="contoh@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={newAccount.role}
                    onChange={(e) => setNewAccount({...newAccount, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="satgas">Satgas Desa (Local Admin)</option>
                    <option value="kecamatan">Admin Kecamatan (Super Admin)</option>
                  </select>
                </div>

                {newAccount.role === 'satgas' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Desa Tugas</label>
                    <input
                      type="text"
                      value={newAccount.desa_tugas}
                      onChange={(e) => setNewAccount({...newAccount, desa_tugas: e.target.value})}
                      placeholder="Nama Desa tempat bertugas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">No. HP (Opsional)</label>
                  <input
                    type="tel"
                    value={newAccount.no_hp}
                    onChange={(e) => setNewAccount({...newAccount, no_hp: e.target.value})}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {createLoading ? 'Memproses...' : 'Buat Akun'}
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