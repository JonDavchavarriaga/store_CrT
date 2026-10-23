import type { CartItem } from '../types/cart';

const CART_STORAGE_KEY = 'chica_rosa_cart_v1';

/**
 * Guarda los ítems del carrito en localStorage de forma segura
 */
export function saveCartToStorage(items: CartItem[]): void {
  try {
    const cleanItems = items
      .filter((item) => item.product && item.quantity > 0)
      .map((item) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          reference: item.product.reference,
          description: item.product.description,
          price_cop: item.product.price_cop,
          compare_at_price_cop: item.product.compare_at_price_cop,
          category_id: item.product.category_id,
          image_urls: item.product.image_urls,
          is_active: item.product.is_active,
          is_available: item.product.is_available,
          is_featured: item.product.is_featured,
        },
        quantity: Math.max(1, Math.floor(item.quantity)),
      }));

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cleanItems));
  } catch (err) {
    // Manejar entornos donde localStorage está restringido o lleno
    console.warn('No se pudo guardar el carrito en almacenamiento local:', err);
  }
}

/**
 * Carga los ítems del carrito desde localStorage
 */
export function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Validar estructura básica de cada ítem
    return parsed
      .filter((item) => item && item.product && typeof item.product.id === 'string' && typeof item.quantity === 'number')
      .map((item) => ({
        product: item.product,
        quantity: Math.max(1, Math.floor(item.quantity)),
      }));
  } catch (err) {
    console.warn('Error al leer el carrito de almacenamiento local:', err);
    return [];
  }
}

/**
 * Limpia el carrito en almacenamiento local
 */
export function clearCartStorage(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (err) {
    console.warn('No se pudo limpiar el carrito en almacenamiento local:', err);
  }
}
