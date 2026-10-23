import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isDemoAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enableDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoAdmin, setIsDemoAdmin] = useState(() => {
    return localStorage.getItem('chica_rosa_demo_admin') === 'true';
  });

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Obtener sesión actual
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      // 2. Escuchar cambios de autenticación
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Modo local / demostración
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      setIsLoading(false);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } else {
      // En modo local sin Supabase configurado, permitir acceso demo controlado
      if (email.trim() && password.length >= 6) {
        setIsDemoAdmin(true);
        localStorage.setItem('chica_rosa_demo_admin', 'true');
        return { success: true };
      }
      return { success: false, error: 'En modo demo ingresa cualquier email y contraseña de al menos 6 caracteres.' };
    }
  };

  const enableDemoAdmin = () => {
    setIsDemoAdmin(true);
    localStorage.setItem('chica_rosa_demo_admin', 'true');
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsDemoAdmin(false);
    localStorage.removeItem('chica_rosa_demo_admin');
  };

  const isAdmin = Boolean(user) || isDemoAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        isDemoAdmin,
        signInWithEmail,
        signOut,
        enableDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
