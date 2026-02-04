import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Edit2, Plus } from 'lucide-react';

export default function WebsitePublikCMS() {
  const { isSuperAdmin } = useAuth();

  const pages = [
    {
      id: 'home',
      title: 'Halaman Beranda (Home)',
      description: 'Kelola konten hero, statistik, proses pelaporan, dan fitur utama di halaman beranda',
      icon: '🏠'
    },
    {
      id: 'profil',
      title: 'Halaman Profil',
      description: 'Kelola visi, misi, informasi kontak, dan media sosial di halaman profil',
      icon: '👥'
    },
  ];

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Manajemen Konten Website Publik</h1>
        <p className="text-gray-600 mt-2">Kelola semua konten halaman publik dari sini</p>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map(page => (
          <div key={page.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="text-4xl mb-3">{page.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{page.title}</h3>
            <p className="text-gray-600 text-sm mb-6">{page.description}</p>
            <Link
              to={page.id === 'home' ? '/admin/cms/home-content' : '/admin/cms/profil-content'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold"
            >
              <Edit2 size={18} />
              Kelola
            </Link>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
        <h3 className="font-bold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Perubahan konten akan langsung terlihat di halaman publik</li>
          <li>• Gunakan gambar dengan ukuran optimal untuk hasil terbaik</li>
          <li>• Pastikan teks deskripsi jelas dan menarik bagi pengunjung</li>
          <li>• Semua field dapat dikosongkan jika tidak diperlukan (kecuali yang wajib)</li>
        </ul>
      </div>
    </div>
  );
}
