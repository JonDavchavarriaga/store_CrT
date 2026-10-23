import React, { useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { formatCOP } from '../../lib/formatters';
import { generateWhatsAppOrderUrl } from '../../lib/whatsapp';
import { STORE_CONFIG } from '../../config/store';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, AlertCircle } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalCOP,
    totalItems,
  } = useCart();

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isCartOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeCart();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const orderResult = generateWhatsAppOrderUrl(items);

  const handleCheckoutWhatsApp = () => {
    if (orderResult.url) {
      // Abrir WhatsApp directamente mediante gesto del usuario
      window.open(orderResult.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(3px)',
        zIndex: 'var(--z-modal)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCart();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          height: '100%',
          boxShadow: 'var(--shadow-drawer)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 200ms ease-out',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Encabezado del Carrito */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShoppingBag size={20} style={{ color: 'var(--rose-kiss)' }} aria-hidden="true" />
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' }}>
              Tu Carrito ({totalItems})
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito de compras"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Contenido / Lista de productos */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: 'var(--space-4) var(--space-5)',
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-12) var(--space-4)',
                color: 'var(--text-secondary)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--lavender-veil)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--rose-kiss)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <ShoppingBag size={32} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', marginBottom: '4px' }}>
                El carrito está vacío
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                Explora el catálogo y añade tus prendas favoritas.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeCart}
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {items.map((item) => {
                const imgUrl = item.product.image_urls?.[0] || STORE_CONFIG.placeholderImageUrl;
                const subtotal = item.product.price_cop * item.quantity;

                return (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      paddingBottom: 'var(--space-4)',
                      borderBottom: '1px solid var(--border-subtle)',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Miniatura */}
                    <img
                      src={imgUrl}
                      alt={item.product.name}
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--lavender-veil)',
                        flexShrink: 0,
                      }}
                    />

                    {/* Datos del producto */}
                    <div style={{ flexGrow: 1 }}>
                      <h4
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          lineHeight: '1.3',
                          marginBottom: '2px',
                        }}
                      >
                        {item.product.name}
                      </h4>

                      {item.product.reference && (
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Ref: {item.product.reference}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-rose)' }}>
                          {formatCOP(item.product.price_cop)}
                        </span>
                        {item.quantity > 1 && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            Subtotal: {formatCOP(subtotal)}
                          </span>
                        )}
                      </div>

                      {/* Controles de cantidad */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                            aria-label={`Disminuir cantidad de ${item.product.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ padding: '0 8px', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                            aria-label={`Aumentar cantidad de ${item.product.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          style={{
                            color: 'var(--text-muted)',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          aria-label={`Eliminar ${item.product.name} del carrito`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                    textDecoration: 'underline',
                  }}
                >
                  Vaciar carrito completo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Carrito con Acción WhatsApp */}
        {items.length > 0 && (
          <div
            style={{
              padding: 'var(--space-4) var(--space-5)',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-subtle)',
            }}
          >
            {/* Resumen Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--space-3)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                Total Estimado:
              </span>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                {formatCOP(totalCOP)}
              </span>
            </div>

            {/* Advertencia si WhatsApp está bloqueado o con error */}
            {orderResult.error ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  backgroundColor: '#FFF4E5',
                  color: '#8A5300',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                <span>{orderResult.error}</span>
              </div>
            ) : (
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                  lineHeight: '1.4',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Al pulsar el botón se abrirá WhatsApp con tu pedido para confirmar disponibilidad y forma de entrega.
              </p>
            )}

            {/* Botón WhatsApp */}
            <button
              type="button"
              className="btn btn-whatsapp"
              onClick={handleCheckoutWhatsApp}
              disabled={Boolean(orderResult.error)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <MessageCircle size={20} aria-hidden="true" />
              <span>Realizar pedido por WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
