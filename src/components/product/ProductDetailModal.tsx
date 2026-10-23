import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../types/product';
import { formatCOP, calculateDiscountPercentage } from '../../lib/formatters';
import { useCart } from '../../context/CartContext';
import { ImageGallery } from './ImageGallery';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus on close button when modal opens
      setTimeout(() => closeBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        previousActiveElement.current?.focus();
      };
    }
  }, [product, onClose]);

  if (!product) return null;

  const discountPercent = calculateDiscountPercentage(product.price_cop, product.compare_at_price_cop);

  const handleAddToCart = () => {
    addItem(product, quantity);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(4px)',
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-6)',
          padding: 'var(--space-6)',
        }}
        className="product-modal-content"
      >
        <style>{`
          @media (min-width: 720px) {
            .product-modal-content {
              grid-template-columns: 1fr 1fr !important;
              padding: var(--space-8) !important;
            }
          }
        `}</style>

        {/* Botón cerrar */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de detalle de producto"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'var(--lavender-veil)',
            color: 'var(--text-secondary)',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <X size={20} aria-hidden="true" />
        </button>

        {/* Galería de 4 imágenes */}
        <div>
          <ImageGallery images={product.image_urls} productName={product.name} />
        </div>

        {/* Información y acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              {product.is_featured && <span className="badge badge-featured">Destacado</span>}
              {discountPercent && <span className="badge badge-sale">Ahorras {discountPercent}%</span>}
              {!product.is_available && <span className="badge badge-unavailable">Temporalmente Agotado</span>}
            </div>

            {product.reference && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Referencia: <strong>{product.reference}</strong>
              </p>
            )}

            <h2
              id="modal-product-title"
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-3)',
                lineHeight: '1.25',
              }}
            >
              {product.name}
            </h2>

            {/* Precios */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-rose)',
                }}
              >
                {formatCOP(product.price_cop)}
              </span>

              {product.compare_at_price_cop && product.compare_at_price_cop > product.price_cop && (
                <span
                  style={{
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatCOP(product.compare_at_price_cop)}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Descripción
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {product.description || 'Sin descripción detallada.'}
              </p>
            </div>
          </div>

          {/* Selector de cantidad y botón */}
          <div>
            {product.is_available ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <label htmlFor="modal-qty" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Cantidad:
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      id="modal-qty"
                      style={{
                        padding: '0 12px',
                        fontWeight: 'var(--font-weight-bold)',
                        minWidth: '32px',
                        textAlign: 'center',
                      }}
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                  style={{ width: '100%', padding: '12px', fontSize: 'var(--font-size-base)' }}
                >
                  <ShoppingBag size={18} aria-hidden="true" />
                  <span>Añadir al carrito • {formatCOP(product.price_cop * quantity)}</span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: '#F7F6F7',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                Este producto se encuentra agotado actualmente. Puedes consultar por WhatsApp si habrá reposición próxima.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
