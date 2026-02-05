import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, Settings, Users, BookOpen, LogOut, Menu, X,
  ChevronDown, Home, BarChart3
} from 'lucide-react';

export default function AdminSidebar() {
  const { profile, logout, isSuperAdmin, isSatgas } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Menu items dengan role-based logic
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Manajemen Kasus',
      icon: FileText,
      show: true,
      submenu: [
        { label: 'Daftar Kasus', path: '/admin/kasus/list' },
      ],
    },
    {
      label: 'Konten & CMS',
      icon: BookOpen,
      show: true,
      submenu: [
        { label: 'Agenda Kegiatan', path: '/admin/cms/agenda' },
        { label: 'Edukasi', path: '/admin/cms/edukasi' },
      ],
    },
    {
      label: 'Pengaturan',
      path: '/admin/settings',
      icon: Settings,
      show: isSuperAdmin(), // Hanya Kecamatan
    },
    {
      label: 'Kelola Akun',
      path: '/admin/accounts',
      icon: Users,
      show: isSuperAdmin(), // Hanya Kecamatan
    },
  ];

  // Filter menu berdasarkan role
  const filteredMenu = menuItems
    .filter(item => {
      if (!item.show) return false;
      if (item.submenu) {
        // Filter submenu berdasarkan showFor
        item.submenu = item.submenu.filter(sub => {
          if (sub.showFor === 'kecamatan' && !isSuperAdmin()) return false;
          if (sub.showFor === 'satgas' && !isSatgas()) return false;
          return true;
        });
        return item.submenu.length > 0;
      }
      return true;
    });

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 left-6 z-40 p-2 bg-primary text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col transition-all z-30 overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <Link
          to="/admin/dashboard"
          className="p-6 flex items-center gap-3 border-b border-gray-800 hover:bg-gray-800 transition"
        >
          <img src="/si-appa-logo-nonbg.png" alt="SI-APPA" className="w-10 h-10" />
          <div>
            <p className="font-bold text-white">SI-APPA</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </Link>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800 bg-gray-800/50">
          <p className="text-sm font-semibold text-white mb-1">{profile?.nama_lengkap}</p>
          <p className="text-xs text-gray-400">
            {isSuperAdmin() ? 'Kecamatan' : profile?.desa_tugas ? ` ${profile.desa_tugas}` : 'Admin'}
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredMenu.map((item, idx) => (
            <div key={idx}>
              {item.submenu ? (
                // Menu Group dengan Submenu
                <div className="space-y-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="space-y-1">
                    {item.submenu.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        to={sub.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-2.5 rounded-lg text-sm transition ${
                          isActive(sub.path)
                            ? 'bg-primary text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                // Single Menu Item
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition text-sm"
          >
            <Home size={20} />
            Lihat Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition text-sm"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
