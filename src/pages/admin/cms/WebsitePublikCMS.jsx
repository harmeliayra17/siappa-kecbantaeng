import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Edit2, Plus } from 'lucide-react';

export default function WebsitePublikCMS() {
  const { isSuperAdmin } = useAuth();

  const pages = [
    {
      id: 'edukasi',
      title: 'Konten Edukasi',
      description: 'Kelola artikel edukasi dan tips kesehatan untuk pemberdayaan perempuan dan anak',
      icon: '📚',
      link: '/admin/cms/edukasi'
    },
    {
      id: 'kegiatan',
      title: 'Agenda Kegiatan',
      description: 'Kelola acara, workshop, dan kegiatan sosialisasi yang diselenggarakan',
      icon: '📅',
      link: '/admin/cms/agenda'
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
        <p className="text-gray-600 mt-2">Kelola konten dinamis halaman publik dari sini</p>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map(page => (
          <div key={page.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="text-4xl mb-3">{page.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{page.title}</h3>
            <p className="text-gray-600 text-sm mb-6">{page.description}</p>
            <Link
              to={page.link}
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
        <h3 className="font-bold text-blue-900 mb-2">💡 Catatan</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Konten Halaman Home dan Profil bersifat static (tidak perlu di-update berkala)</li>
          <li>• Fokus pada pengelolaan Edukasi dan Agenda Kegiatan yang dinamis</li>
          <li>• Gunakan gambar dengan ukuran optimal untuk hasil terbaik</li>
          <li>• Pastikan deskripsi jelas dan menarik bagi pengunjung website</li>
        </ul>
      </div>
    </div>
  );
}
