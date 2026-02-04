import React, { memo } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #ede8f5 0%, #e8d5f2 20%, #f5f0fa 40%, #e8d5f2 60%, #ede8f5 80%, #e8d5f2 100%)'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex" style={{
      background: 'linear-gradient(135deg, #ede8f5 0%, #e8d5f2 20%, #f5f0fa 40%, #e8d5f2 60%, #ede8f5 80%, #e8d5f2 100%)'
    }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default memo(AdminLayout);
