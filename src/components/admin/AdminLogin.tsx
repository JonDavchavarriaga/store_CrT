import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Lock, Mail, Key, AlertCircle, ArrowLeft } from 'lucide-react';
import { STORE_CONFIG } from '../../config/store';

interface AdminLoginProps {
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { signInWithEmail, enableDemoAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: 'var(--space-6) var(--space-4)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--lavender-veil)',
              color: 'var(--rose-kiss)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <Lock size={24} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
            Panel Administrativo
          </h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Acceso exclusivo para gestión de catálogo de {STORE_CONFIG.name}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div
            style={{
              backgroundColor: '#FFF8E6',
              border: '1px solid #FFE4A0',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              color: '#8A5300',
              marginBottom: 'var(--space-4)',
              lineHeight: '1.4',
            }}
          >
            <strong>Modo Demostración Local:</strong> Las credenciales de Supabase aún no están configuradas en <code>.env</code>. Puedes ingresar con cualquier correo para probar el panel administrativo o hacer clic en el botón inferior.
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              backgroundColor: '#FDF2F4',
              border: '1px solid #F8CCD4',
              color: 'var(--text-danger)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '6px' }}
            >
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <input
                id="admin-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@chicarosa.co"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '6px' }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Key
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <input
                id="admin-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Ingresar al Panel'}
          </button>

          {!isSupabaseConfigured && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={enableDemoAdmin}
              style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}
            >
              Probar como Administrador Demo
            </button>
          )}

          <button
            type="button"
            onClick={onBackToStore}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
              marginTop: 'var(--space-2)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Volver a la tienda pública</span>
          </button>
        </form>
      </div>
    </div>
  );
};
