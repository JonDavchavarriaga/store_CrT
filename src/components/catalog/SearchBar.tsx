import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar por nombre o referencia (ej. Vestido, CR-001)...',
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
      }}
    >
      <label htmlFor="catalog-search" className="visually-hidden">
        Buscar productos
      </label>
      <div
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search size={18} aria-hidden="true" />
      </div>

      <input
        id="catalog-search"
        type="search"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          paddingLeft: '42px',
          paddingRight: value ? '40px' : '16px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-medium)',
          fontSize: 'var(--font-size-sm)',
        }}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Borrar búsqueda"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
