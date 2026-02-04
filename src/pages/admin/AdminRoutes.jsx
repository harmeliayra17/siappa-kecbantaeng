import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';

// Loading component untuk admin
const AdminLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-body">Memuat halaman admin...</p>
    </div>
  </div>
);

// Lazy load Admin Pages
const Dashboard = lazy(() => import('./Dashboard'));
const ListKasus = lazy(() => import('./kasus/ListKasus'));
const DetailKasus = lazy(() => import('./kasus/DetailKasus'));
const AgendaList = lazy(() => import('./cms/AgendaList'));
const AgendaForm = lazy(() => import('./cms/AgendaForm'));
const EdukasiList = lazy(() => import('./cms/EdukasiList'));
const EdukasiForm = lazy(() => import('./cms/EdukasiForm'));
const WebsitePublikCMS = lazy(() => import('./cms/WebsitePublikCMS'));
const WebSettings = lazy(() => import('./settings/WebSettings'));
const AkunSatgas = lazy(() => import('./settings/AkunSatgas'));

export default function AdminRoutes() {
  const { isSuperAdmin } = useAuth();

  return (
    <AdminLayout>
      <Suspense fallback={<AdminLoading />}>
        <Routes>
          {/* Dashboard - accessible to all authenticated admin users */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Kasus Management */}
          <Route path="kasus/list" element={<ListKasus />} />
          <Route path="kasus/:id" element={<DetailKasus />} />

          {/* CMS */}
          <Route path="cms/agenda" element={<AgendaList />} />
          <Route path="cms/agenda/tambah" element={<AgendaForm />} />
          <Route path="cms/agenda/edit/:id" element={<AgendaForm />} />
          <Route path="cms/edukasi" element={isSuperAdmin() ? <EdukasiList /> : <Navigate to="/admin/dashboard" replace />} />
          <Route path="cms/edukasi/tambah" element={isSuperAdmin() ? <EdukasiForm /> : <Navigate to="/admin/dashboard" replace />} />
          <Route path="cms/edukasi/edit/:id" element={isSuperAdmin() ? <EdukasiForm /> : <Navigate to="/admin/dashboard" replace />} />
          <Route path="cms/website" element={isSuperAdmin() ? <WebsitePublikCMS /> : <Navigate to="/admin/dashboard" replace />} />

          {/* Settings - Kecamatan only */}
          <Route path="settings" element={isSuperAdmin() ? <WebSettings /> : <Navigate to="/admin/dashboard" replace />} />
          <Route path="accounts" element={isSuperAdmin() ? <AkunSatgas /> : <Navigate to="/admin/dashboard" replace />} />

          {/* Fallback */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
}
