import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../../types/product';
import { catalogService } from '../../services/catalogService';
import { X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ProductFormModalProps {
  product: Product | null; // null si es nuevo producto
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [priceCOP, setPriceCOP] = useState<number | ''>('');
  const [comparePriceCOP, setComparePriceCOP] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setReference(product.reference || '');
      setDescription(product.description || '');
      setPriceCOP(product.price_cop);
      setComparePriceCOP(product.compare_at_price_cop ?? '');
      setCategoryId(product.category_id);
      setImageUrls(product.image_urls || []);
      setIsActive(product.is_active);
      setIsAvailable(product.is_available);
      setIsFeatured(product.is_featured);
    } else {
      setName('');
      setReference('');
      setDescription('');
      setPriceCOP('');
      setComparePriceCOP('');
      setCategoryId(categories[0]?.id || '');
      setImageUrls([]);
      setIsActive(true);
      setIsAvailable(true);
      setIsFeatured(false);
    }
    setError(null);
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (imageUrls.length >= 4) {
      setError('Solo se permite un máximo de 4 imágenes por producto.');
      return;
    }
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
    setError(null);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imageUrls.length) return;

    const copy = [...imageUrls];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setImageUrls(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }

    if (priceCOP === '' || Number(priceCOP) < 0) {
      setError('Ingresa un precio válido mayor o igual a 0 en COP.');
      return;
    }

    const cleanComparePrice = comparePriceCOP === '' ? null : Number(comparePriceCOP);
    if (cleanComparePrice !== null && cleanComparePrice <= Number(priceCOP)) {
      setError('El precio anterior (tachado) debe ser estrictamente mayor que el precio actual de venta.');
      return;
    }

    setIsSaving(true);
    const res = await catalogService.saveProduct({
      id: product?.id,
      name: name.trim(),
      reference: reference.trim() || null,
      description: description.trim(),
      price_cop: Number(priceCOP),
      compare_at_price_cop: cleanComparePrice,
      category_id: categoryId,
      image_urls: imageUrls,
      is_active: isActive,
      is_available: isAvailable,
      is_featured: isFeatured,
    });
    setIsSaving(false);

    if (!res.success || !res.product) {
      setError(res.error || 'Ocurrió un error al guardar el producto.');
      return;
    }

    onSaved(res.product);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-form-title"
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-6)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 id="modal-product-form-title" style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' }}>
            {product ? `Editar Producto: ${product.name}` : 'Crear Nuevo Producto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: '#FDF2F4',
              color: 'var(--text-danger)',
              border: '1px solid #F8CCD4',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Nombre */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
              Nombre Comercial *
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Vestido Rosa Palo Elegance"
              required
            />
          </div>

          {/* Referencia y Categoría */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
                Referencia (Código SKU)
              </label>
              <input
                type="text"
                className="form-input"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. CR-VES-001"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
                Categoría *
              </label>
              <select
                className="form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precios COP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
                Precio Venta (COP) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={priceCOP}
                onChange={(e) => setPriceCOP(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="89000"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
                Precio Anterior / Tachado (COP)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={comparePriceCOP}
                onChange={(e) => setComparePriceCOP(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="Opcional (ej. 110000)"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
              Descripción
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre tela, horma, ocasión de uso..."
            />
          </div>

          {/* Gestión de hasta 4 Imágenes */}
          <div style={{ backgroundColor: 'var(--bg-app)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
                Imágenes ({imageUrls.length} / 4)
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                La primera imagen es la portada principal
              </span>
            </div>

            {/* Lista actual */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <img
                    src={url}
                    alt=""
                    style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholders/product-placeholder.svg';
                    }}
                  />
                  <span style={{ flexGrow: 1, fontSize: 'var(--font-size-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {index === 0 ? '★ Portada: ' : `${index + 1}. `} {url}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveImage(index, 'up')}
                      aria-label="Subir orden"
                      style={{ padding: '4px', opacity: index === 0 ? 0.3 : 1 }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === imageUrls.length - 1}
                      onClick={() => handleMoveImage(index, 'down')}
                      aria-label="Bajar orden"
                      style={{ padding: '4px', opacity: index === imageUrls.length - 1 ? 0.3 : 1 }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      aria-label="Eliminar imagen"
                      style={{ padding: '4px', color: 'var(--text-danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Añadir imagen */}
            {imageUrls.length < 4 && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: 'var(--font-size-xs)', minHeight: '36px', padding: '6px 10px' }}
                  placeholder="URL o ruta de imagen (ej. /images/products/vestido-01.webp)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddImage}
                  style={{ minHeight: '36px', padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                >
                  <Plus size={14} />
                  <span>Añadir</span>
                </button>
              </div>
            )}
          </div>

          {/* Switches de Estado */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
              backgroundColor: 'var(--lavender-veil)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span><strong>Visible en tienda</strong> (Activo)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <span><strong>Disponible para pedir</strong> (En stock)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <span><strong>Producto Destacado</strong></span>
            </label>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : product ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
