import React from 'react';
import type { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  onResetFilters,
}) => {
  if (products.length === 0) {
    return (
      <div
        role="status"
        style={{
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-4)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          margin: 'var(--space-6) 0',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--lavender-veil)',
            color: 'var(--rose-kiss)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <PackageOpen size={36} aria-hidden="true" />
        </div>
        <h3
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-2)',
          }}
        >
          No encontramos productos
        </h3>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            maxWidth: '380px',
            margin: '0 auto var(--space-6)',
          }}
        >
          No hay artículos que coincidan con los filtros o la búsqueda actual.
        </p>
        {onResetFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onResetFilters}
          >
            Restablecer búsqueda y filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 'var(--space-3)',
      }}
      className="catalog-grid"
    >
      <style>{`
        @media (min-width: 600px) {
          .catalog-grid {
            grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)) !important;
            gap: var(--space-4) !important;
          }
        }
        @media (min-width: 900px) {
          .catalog-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
            gap: var(--space-6) !important;
          }
        }
      `}</style>

      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onSelectProduct}
          isPriority={idx < 4}
        />
      ))}
    </div>
  );
};
