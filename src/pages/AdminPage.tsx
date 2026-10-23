import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types/product';
import { catalogService } from '../services/catalogService';
import { useAuth } from '../context/AuthContext';
import { AdminLogin } from '../components/admin/AdminLogin';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { CatalogImporter } from '../components/admin/CatalogImporter';
import { formatCOP } from '../lib/formatters';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Plus,
  Upload,
  Edit2,
  Trash2,
  LogOut,
  ArrowLeft,
  Check,
  X,
  Search,
} from 'lucide-react';

interface AdminPageProps {
  onNavigateStore: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateStore }) => {
  const { isAdmin, signOut, isDemoAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros en admin
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Estado del modal de producto completo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado del importador masivo
  const [showImporter, setShowImporter] = useState(false);

  // Edición rápida de precio en línea
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);
  const [quickPriceError, setQuickPriceError] = useState<string | null>(null);
  const [quickSaving, setQuickSaving] = useState(false);

  // Mensaje de éxito o error global
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getAdminProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Error cargando datos de administración:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Si no está autenticado, mostrar formulario de login
  if (!isAdmin) {
    return <AdminLogin onBackToStore={onNavigateStore} />;
  }

  // Métricas del catálogo (Sección 6.2)
  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.is_active).length;
    const hidden = total - active;
    const unavailable = products.filter((p) => !p.is_available).length;
    const missingImage = products.filter((p) => !p.image_urls || p.image_urls.length === 0).length;
    const invalidPrice = products.filter((p) => typeof p.price_cop !== 'number' || p.price_cop < 0).length;

    return { total, active, hidden, unavailable, missingImage, invalidPrice };
  }, [products]);

  // Filtrado de la lista en admin
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Acción: Iniciar edición rápida de precio
  const startQuickEdit = (p: Product) => {
    setQuickEditId(p.id);
    setQuickPriceVal(p.price_cop);
    setQuickPriceError(null);
  };

  const cancelQuickEdit = () => {
    setQuickEditId(null);
    setQuickPriceError(null);
  };

  const saveQuickPrice = async (p: Product) => {
    if (quickPriceVal < 0 || !Number.isInteger(quickPriceVal)) {
      setQuickPriceError('Debe ser entero >= 0');
      return;
    }

    setQuickSaving(true);
    const res = await catalogService.updateProductPrice(p.id, quickPriceVal, p.compare_at_price_cop);
    setQuickSaving(false);

    if (res.success && res.product) {
      setProducts((prev) => prev.map((item) => (item.id === p.id ? res.product! : item)));
      setQuickEditId(null);
      setStatusMessage({ type: 'success', text: `Precio de "${p.name}" actualizado a ${formatCOP(quickPriceVal)}.` });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setQuickPriceError(res.error || 'Error al guardar precio.');
    }
  };

  // Toggle de visibilidad (is_active)
  const handleToggleActive = async (p: Product) => {
    const newVal = !p.is_active;
    const res = await catalogService.toggleProductStatus(p.id, 'is_active', newVal);
    if (res.success) {
      setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, is_active: newVal } : item)));
      setStatusMessage({
        type: 'success',
        text: `"${p.name}" ahora está ${newVal ? 'visible en la tienda' : 'oculto del catálogo'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Toggle de disponibilidad (is_available)
  const handleToggleAvailable = async (p: Product) => {
    const newVal = !p.is_available;
    const res = await catalogService.toggleProductStatus(p.id, 'is_available', newVal);
    if (res.success) {
      setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, is_available: newVal } : item)));
      setStatusMessage({
        type: 'success',
        text: `"${p.name}" ahora está ${newVal ? 'disponible para pedidos' : 'marcado como agotado'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (p: Product) => {
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar permanentemente el producto "${p.name}"?`);
    if (!confirmDelete) return;

    const res = await catalogService.deleteProduct(p.id);
    if (res.success) {
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      setStatusMessage({ type: 'success', text: `Producto "${p.name}" eliminado correctamente.` });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <main style={{ minHeight: '85vh', backgroundColor: 'var(--bg-app)', paddingBottom: 'var(--space-16)' }}>
      {/* Barra superior de administración */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={onNavigateStore}
              className="btn btn-outline"
              style={{ fontSize: 'var(--font-size-xs)', padding: '6px 12px', minHeight: '36px' }}
            >
              <ArrowLeft size={14} />
              <span>Volver a Tienda</span>
            </button>
            <h1 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' }}>
              Administración de Catálogo
            </h1>
            {isDemoAdmin && !isSupabaseConfigured && (
              <span className="badge badge-featured">Modo Demo Local</span>
            )}
          </div>

          <button
            onClick={() => signOut()}
            className="btn btn-outline"
            style={{ fontSize: 'var(--font-size-xs)', padding: '6px 12px', minHeight: '36px', color: 'var(--text-danger)' }}
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: 'var(--space-6)' }}>
        {/* Mensaje de estado flotante */}
        {statusMessage && (
          <div
            role="status"
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 'var(--space-4)',
              backgroundColor: statusMessage.type === 'success' ? '#EBF8F1' : '#FDF2F4',
              color: statusMessage.type === 'success' ? 'var(--text-success)' : 'var(--text-danger)',
              border: `1px solid ${statusMessage.type === 'success' ? '#BFEAD3' : '#F8CCD4'}`,
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* =====================================================================
            RESUMEN DE MÉTRICAS (SECCIÓN 6.2)
            ===================================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Productos</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{metrics.total}</p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Activos (Visibles)</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--text-success)', marginTop: '4px' }}>{metrics.active}</p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Ocultos</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--text-secondary)', marginTop: '4px' }}>{metrics.hidden}</p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Agotados</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--text-warning)', marginTop: '4px' }}>{metrics.unavailable}</p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Sin Imagen</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: metrics.missingImage > 0 ? 'var(--text-danger)' : 'var(--text-muted)', marginTop: '4px' }}>
              {metrics.missingImage}
            </p>
          </div>
        </div>

        {/* Acciones principales y buscador */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {/* Búsqueda y categoría */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexGrow: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', minHeight: '38px', fontSize: 'var(--font-size-xs)' }}
                placeholder="Buscar por nombre o ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto', minHeight: '38px', fontSize: 'var(--font-size-xs)' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowImporter(!showImporter)}
              style={{ fontSize: 'var(--font-size-xs)', minHeight: '38px' }}
            >
              <Upload size={14} />
              <span>{showImporter ? 'Ocultar Importador' : 'Importar CSV'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              style={{ fontSize: 'var(--font-size-xs)', minHeight: '38px' }}
            >
              <Plus size={14} />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Importador masivo plegable */}
        {showImporter && (
          <CatalogImporter
            categories={categories}
            onImportCompleted={() => {
              loadAdminData();
              setStatusMessage({ type: 'success', text: 'Catálogo actualizado tras importación.' });
              setTimeout(() => setStatusMessage(null), 3000);
            }}
          />
        )}

        {/* Tabla / Lista Adaptable de Productos (Sección 6.3) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            overflowX: 'auto',
          }}
        >
          {isLoading ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando catálogo administrativo...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron productos con los criterios actuales.
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-app)' }}>
                  <th style={{ padding: '12px 16px' }}>Producto</th>
                  <th style={{ padding: '12px 16px' }}>Referencia</th>
                  <th style={{ padding: '12px 16px' }}>Precio Venta (COP) • Edición Rápida</th>
                  <th style={{ padding: '12px 16px' }}>Visible</th>
                  <th style={{ padding: '12px 16px' }}>Disponible</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isQuickEditing = quickEditId === p.id;
                  const thumb = p.image_urls?.[0] || '/images/placeholders/product-placeholder.svg';

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: p.is_active ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      {/* Producto */}
                      <td style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={thumb}
                          alt=""
                          style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholders/product-placeholder.svg';
                          }}
                        />
                        <div>
                          <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                            {p.name}
                          </p>
                          {p.is_featured && <span className="badge badge-featured" style={{ fontSize: '10px' }}>Destacado</span>}
                        </div>
                      </td>

                      {/* Referencia */}
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                        {p.reference || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>

                      {/* Edición rápida de precio */}
                      <td style={{ padding: '10px 16px' }}>
                        {isQuickEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              className="form-input"
                              style={{ width: '110px', minHeight: '32px', padding: '4px 8px', fontSize: '12px' }}
                              value={quickPriceVal}
                              onChange={(e) => setQuickPriceVal(parseInt(e.target.value, 10) || 0)}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveQuickPrice(p)}
                              disabled={quickSaving}
                              style={{ padding: '6px', color: 'var(--text-success)' }}
                              aria-label="Confirmar precio"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={cancelQuickEdit}
                              style={{ padding: '6px', color: 'var(--text-danger)' }}
                              aria-label="Cancelar edición rápida"
                            >
                              <X size={16} />
                            </button>
                            {quickPriceError && <span style={{ color: 'var(--text-danger)', fontSize: '11px' }}>{quickPriceError}</span>}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-rose)' }}>
                              {formatCOP(p.price_cop)}
                            </span>
                            <button
                              type="button"
                              onClick={() => startQuickEdit(p)}
                              style={{
                                padding: '3px 6px',
                                fontSize: '11px',
                                backgroundColor: 'var(--lavender-veil)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                              }}
                              title="Modificar precio rápidamente"
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Toggle Visible */}
                      <td style={{ padding: '10px 16px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: p.is_active ? '#E2F5EA' : '#FEECEE',
                            color: p.is_active ? 'var(--text-success)' : 'var(--text-danger)',
                          }}
                        >
                          {p.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span>{p.is_active ? 'Visible' : 'Oculto'}</span>
                        </button>
                      </td>

                      {/* Toggle Disponible */}
                      <td style={{ padding: '10px 16px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(p)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: p.is_available ? '#E8F1FC' : '#FFF4E5',
                            color: p.is_available ? '#1D63B8' : 'var(--text-warning)',
                          }}
                        >
                          {p.is_available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          <span>{p.is_available ? 'En Stock' : 'Agotado'}</span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                            style={{ padding: '6px', color: 'var(--text-secondary)' }}
                            title="Editar producto completo"
                            aria-label={`Editar ${p.name}`}
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            style={{ padding: '6px', color: 'var(--text-danger)' }}
                            title="Eliminar producto"
                            aria-label={`Eliminar ${p.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Crear / Editar Producto */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={(savedProduct) => {
          setProducts((prev) => {
            const index = prev.findIndex((item) => item.id === savedProduct.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = savedProduct;
              return updated;
            }
            return [savedProduct, ...prev];
          });
          setStatusMessage({ type: 'success', text: `Producto "${savedProduct.name}" guardado exitosamente.` });
          setTimeout(() => setStatusMessage(null), 3000);
        }}
      />
    </main>
  );
};
