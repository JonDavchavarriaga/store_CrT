import React from 'react';
import { ShoppingBag, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { STORE_CONFIG } from '../../config/store';

interface HeaderProps {
  currentView: 'store' | 'admin';
  onNavigate: (view: 'store' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { totalItems, openCart } = useCart();

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Saltar al contenido principal
      </a>

      <header
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-subtle)',
          zIndex: 'var(--z-sticky)',
          transition: 'box-shadow var(--transition-fast)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-3)',
            paddingBottom: 'var(--space-3)',
            gap: 'var(--space-4)',
          }}
        >
          {/* Logo */}
          <button
            onClick={() => onNavigate('store')}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: 0,
            }}
            aria-label="Ir al inicio de Chica Rosa"
          >
            <img
              src={STORE_CONFIG.logoUrl}
              alt={STORE_CONFIG.logoAlt}
              style={{
                height: '42px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </button>

          {/* Navegación y Acciones */}
          <nav aria-label="Navegación principal" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => onNavigate('store')}
              style={{
                fontWeight: currentView === 'store' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                color: currentView === 'store' ? 'var(--text-rose)' : 'var(--text-secondary)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Catálogo
            </button>

            <button
              onClick={() => onNavigate('admin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: currentView === 'admin' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                color: currentView === 'admin' ? 'var(--text-rose)' : 'var(--text-muted)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
              }}
              aria-label="Panel de Administración"
            >
              <Lock size={14} aria-hidden="true" />
              <span>Admin</span>
            </button>

            {/* Botón del Carrito */}
            <button
              onClick={openCart}
              className="btn btn-secondary"
              style={{
                position: 'relative',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                minHeight: '40px',
              }}
              aria-label={`Ver carrito de compras, ${totalItems} productos agregados`}
            >
              <ShoppingBag size={18} aria-hidden="true" style={{ color: 'var(--rose-kiss)' }} />
              <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                {totalItems}
              </span>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
};
