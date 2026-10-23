import React, { useState } from 'react';
import type { Product } from '../../types/product';
import { formatCOP, calculateDiscountPercentage } from '../../lib/formatters';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Eye } from 'lucide-react';
import { STORE_CONFIG } from '../../config/store';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isPriority?: boolean; // Para evitar lazy loading en los primeros productos visibles
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, isPriority = false }) => {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const mainImageUrl = (!imageError && product.image_urls && product.image_urls.length > 0)
    ? product.image_urls[0]
    : STORE_CONFIG.placeholderImageUrl;

  const discountPercent = calculateDiscountPercentage(product.price_cop, product.compare_at_price_cop);

  return (
    <article
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
    >
      {/* Contenedor de Imagen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%', // Proporción 1:1 cuadrada
          backgroundColor: 'var(--lavender-veil)',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onClick={() => onSelect(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(product);
          }
        }}
        aria-label={`Ver detalles de ${product.name}`}
      >
        <img
          src={mainImageUrl}
          alt={product.name}
          loading={isPriority ? 'eager' : 'lazy'}
          decoding={isPriority ? 'sync' : 'async'}
          onError={() => setImageError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)',
          }}
        />

        {/* Badges superiores */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {product.is_featured && (
            <span className="badge badge-featured">Destacado</span>
          )}
          {discountPercent && (
            <span className="badge badge-sale">-{discountPercent}%</span>
          )}
          {!product.is_available && (
            <span className="badge badge-unavailable">Agotado</span>
          )}
        </div>

        {/* Hover sutil de ver detalle */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-full)',
            padding: '6px',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <Eye size={16} />
        </div>
      </div>

      {/* Información del Producto */}
      <div
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {product.reference && (
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                marginBottom: '4px',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Ref: {product.reference}
            </p>
          )}

          <h3
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text-primary)',
              lineHeight: '1.35',
              marginBottom: 'var(--space-2)',
              cursor: 'pointer',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7em',
            }}
            onClick={() => onSelect(product)}
          >
            {product.name}
          </h3>
        </div>

        <div>
          {/* Precios */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-md)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-rose)',
              }}
            >
              {formatCOP(product.price_cop)}
            </span>

            {product.compare_at_price_cop && product.compare_at_price_cop > product.price_cop && (
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through',
                }}
              >
                {formatCOP(product.compare_at_price_cop)}
              </span>
            )}
          </div>

          {/* Botón de acción */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addItem(product, 1)}
            disabled={!product.is_available}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 'var(--font-size-xs)',
            }}
            aria-label={
              product.is_available
                ? `Añadir ${product.name} al carrito`
                : `${product.name} agotado`
            }
          >
            <ShoppingBag size={15} aria-hidden="true" />
            <span>{product.is_available ? 'Añadir al carrito' : 'Agotado'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
