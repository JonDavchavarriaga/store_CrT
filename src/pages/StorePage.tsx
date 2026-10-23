import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category, ProductSortOption } from '../types/product';
import { catalogService } from '../services/catalogService';
import { SearchBar } from '../components/catalog/SearchBar';
import { CategoryFilters } from '../components/catalog/CategoryFilters';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { ProductDetailModal } from '../components/product/ProductDetailModal';
import { STORE_CONFIG } from '../config/store';
import { ArrowDown, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';

export const StorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ProductSortOption>('featured');

  // Modal de detalle
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getPublicProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Error cargando catálogo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado y ordenamiento en cliente (rápido y sin consultas de red por letra)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Filtro por categoría
    if (selectedCategoryId) {
      result = result.filter((p) => p.category_id === selectedCategoryId);
    }

    // 2. Filtro por búsqueda (nombre o referencia)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.reference && p.reference.toLowerCase().includes(query)) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // 3. Ordenamiento
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.is_featured === b.is_featured) return 0;
        return a.is_featured ? -1 : 1;
      }
      if (sortBy === 'price_asc') {
        return a.price_cop - b.price_cop;
      }
      if (sortBy === 'price_desc') {
        return b.price_cop - a.price_cop;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name, 'es');
      }
      return 0;
    });

    return result;
  }, [products, selectedCategoryId, searchQuery, sortBy]);

  return (
    <main id="main-content" style={{ flexGrow: 1 }}>
      {/* =========================================================================
          HERO SECTION - IDENTIDAD VISUAL CHICA ROSA
          ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FDF7FA 0%, #F8EEF5 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-10)',
          paddingBottom: 'var(--space-10)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Tag de Marca */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--soft-blossom)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--space-4)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--rose-kiss)' }} aria-hidden="true" />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>
              Colección y Catálogo Digital
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-3)',
              maxWidth: '680px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Moda femenina pensada para resaltar tu estilo propio
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-secondary)',
              maxWidth: '520px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.5',
              marginBottom: 'var(--space-6)',
            }}
          >
            Prepara tu carrito en pesos colombianos y confirma tu pedido directamente por WhatsApp con nuestro equipo.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <a
              href="#catalog-section"
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              <span>Explorar Catálogo</span>
              <ArrowDown size={16} aria-hidden="true" />
            </a>

            {STORE_CONFIG.whatsappValidation.isValid && (
              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappValidation.formattedNumber}?text=${encodeURIComponent('Hola Chica Rosa, tengo una consulta sobre sus productos.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '12px 20px' }}
              >
                <MessageCircle size={16} style={{ color: 'var(--btn-whatsapp-bg)' }} aria-hidden="true" />
                <span>Escríbenos a WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CATÁLOGO INTERACTIVO
          ========================================================================= */}
      <section id="catalog-section" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          {/* Barra de Búsqueda y Título de Sección */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: '4px' }}>
                Nuestros Productos
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
            </div>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Filtros de Categorías y Orden */}
          <CategoryFilters
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            sortBy={sortBy}
            onSelectSort={setSortBy}
          />

          {/* Grid o Loading */}
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-16) 0',
                gap: 'var(--space-3)',
                color: 'var(--text-muted)',
              }}
              role="status"
              aria-live="polite"
            >
              <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--rose-kiss)' }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>Cargando catálogo de Chica Rosa...</p>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onSelectProduct={setSelectedProduct}
              onResetFilters={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
                setSortBy('featured');
              }}
            />
          )}
        </div>
      </section>

      {/* Modal de Detalle */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
};
