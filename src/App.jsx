import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Lazy load halaman public
const Home = lazy(() => import('./pages/public/Home'));
const Lapor = lazy(() => import('./pages/public/Lapor'));
const Agenda = lazy(() => import('./pages/public/Agenda'));
const Edukasi = lazy(() => import('./pages/public/Edukasi'));
const Profil = lazy(() => import('./pages/public/Profil'));
const DetailEdukasi = lazy(() => import('./pages/public/DetailEdukasi'));
const DetailKegiatan = lazy(() => import('./pages/public/DetailKegiatan'));

// Import Auth & Admin
import Login from './pages/auth/Login';
import AdminRoutes from './pages/admin/AdminRoutes';

// Loading component
const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-body">Memuat halaman...</p>
    </div>
  </div>
);

// ProtectedRoute component untuk cek login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="font-sans antialiased min-h-screen flex flex-col">
      {!isLoginPage && !isAdminPage && <Navbar />}
      
      <div className="flex-1">
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
          <Route path="/lapor" element={<Lapor />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/agenda/:id" element={<DetailKegiatan />} />
          <Route path="/edukasi" element={<Edukasi />} />
          <Route path="/edukasi/:id" element={<DetailEdukasi />} />
          <Route path="/profil" element={<Profil />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin/*" element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </div>

      {!isLoginPage && !isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;