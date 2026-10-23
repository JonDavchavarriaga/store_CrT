import React from 'react';
import type { Category, ProductSortOption } from '../../types/product';
import { ArrowUpDown } from 'lucide-react';

interface CategoryFiltersProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  sortBy: ProductSortOption;
  onSelectSort: (sort: ProductSortOption) => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onSelectSort,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginTop: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {/* Selector de Categorías (Chips) */}
      <div
        role="group"
        aria-label="Filtrar por categoría"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            backgroundColor: selectedCategoryId === null ? 'var(--rose-kiss)' : '#FFFFFF',
            color: selectedCategoryId === null ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: `1px solid ${selectedCategoryId === null ? 'var(--rose-kiss)' : 'var(--border-medium)'}`,
            transition: 'all var(--transition-fast)',
          }}
          aria-pressed={selectedCategoryId === null}
        >
          Todos
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                backgroundColor: isSelected ? 'var(--rose-kiss)' : '#FFFFFF',
                color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: `1px solid ${isSelected ? 'var(--rose-kiss)' : 'var(--border-medium)'}`,
                transition: 'all var(--transition-fast)',
              }}
              aria-pressed={isSelected}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Ordenamiento */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <ArrowUpDown size={16} aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
        <label htmlFor="sort-select" className="visually-hidden">
          Ordenar productos
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSelectSort(e.target.value as ProductSortOption)}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="featured">Destacados primero</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
          <option value="name_asc">Nombre (A - Z)</option>
        </select>
      </div>
    </div>
  );
};
