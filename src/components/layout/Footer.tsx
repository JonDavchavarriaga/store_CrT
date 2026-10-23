import React from 'react';
import { STORE_CONFIG } from '../../config/store';
import { MessageCircle, ShieldCheck, Truck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateAdmin }) => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        paddingTop: 'var(--space-10)',
        paddingBottom: 'var(--space-8)',
      }}
    >
      <div className="container">
        {/* Pilares comerciales informativos */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)',
            paddingBottom: 'var(--space-8)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div
              style={{
                backgroundColor: 'var(--lavender-veil)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--rose-kiss)',
              }}
            >
              <MessageCircle size={22} aria-hidden="true" />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: '4px' }}>
                Atención por WhatsApp
              </h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {STORE_CONFIG.commercialInfo.orderNote}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div
              style={{
                backgroundColor: 'var(--lavender-veil)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--rose-kiss)',
              }}
            >
              <Truck size={22} aria-hidden="true" />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: '4px' }}>
                Envíos en Colombia
              </h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {STORE_CONFIG.commercialInfo.shippingNote}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div
              style={{
                backgroundColor: 'var(--lavender-veil)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--rose-kiss)',
              }}
            >
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: '4px' }}>
                Compra Transparente
              </h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Verificación manual de inventario antes de pagar. Sin intermediarios ni pasarelas costosas.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen inferior */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            <p>
              © {new Date().getFullYear()} <strong>{STORE_CONFIG.name}</strong> — {STORE_CONFIG.country} ({STORE_CONFIG.currency})
            </p>
            <p style={{ marginTop: '2px' }}>{STORE_CONFIG.tagline}</p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <button
              onClick={onNavigateAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-muted)',
                fontSize: 'var(--font-size-xs)',
                textDecoration: 'underline',
              }}
            >
              <Lock size={12} aria-hidden="true" />
              <span>Acceso Administrador</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
