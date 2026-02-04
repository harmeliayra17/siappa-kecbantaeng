import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile dari database dengan cache
  const fetchProfile = async (userId) => {
    // Check localStorage cache
    const cachedProfile = localStorage.getItem(`profile_${userId}`);
    if (cachedProfile) {
      const profile = JSON.parse(cachedProfile);
      setProfile(profile);
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      // Cache ke localStorage
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  // Check user saat app mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Cek session yang sudah ada
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe ke perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        // Fetch profile di background - jangan block login
        fetchProfile(data.user.id).catch(console.error);
        return { success: true, user: data.user };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register function (Untuk Satgas baru)
  const register = async (email, password, nama_lengkap, role, desa_tugas, no_hp) => {
    try {
      setError(null);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile di database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email,
            nama_lengkap,
            role,
            desa_tugas: role === 'satgas' ? desa_tugas : null,
            no_hp,
          }]);

        if (profileError) throw profileError;

        return { success: true, user: authData.user };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Helper: Check if user is admin (Satgas or Kecamatan)
  const isAdmin = () => {
    return profile?.role === 'satgas' || profile?.role === 'kecamatan';
  };

  // Helper: Check if user is super admin (Kecamatan)
  const isSuperAdmin = () => {
    return profile?.role === 'kecamatan';
  };

  // Helper: Check if user is satgas
  const isSatgas = () => {
    return profile?.role === 'satgas';
  };

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    logout,
    register,
    isAdmin,
    isSuperAdmin,
    isSatgas,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook untuk menggunakan AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  
  return context;
}
