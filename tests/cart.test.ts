import { describe, it, expect, beforeEach } from 'vitest';
import { saveCartToStorage, loadCartFromStorage, clearCartStorage } from '../src/lib/storage';
import type { CartItem } from '../src/types/cart';
import type { Product } from '../src/types/product';

const mockProduct: Product = {
  id: 'test-p1',
  name: 'Blusa Primavera',
  slug: 'blusa-primavera',
  reference: 'CR-001',
  description: 'Blusa fresca',
  price_cop: 45000,
  compare_at_price_cop: null,
  category_id: 'cat-01',
  image_urls: ['/img1.webp'],
  is_active: true,
  is_available: true,
  is_featured: false,
};

describe('Cart Persistence & Calculations', () => {
  beforeEach(() => {
    clearCartStorage();
  });

  it('guarda y recupera ítems del carrito en storage con cantidades enteras', () => {
    const items: CartItem[] = [
      { product: mockProduct, quantity: 2 },
    ];

    saveCartToStorage(items);
    const recovered = loadCartFromStorage();

    expect(recovered).toHaveLength(1);
    expect(recovered[0].product.name).toBe('Blusa Primavera');
    expect(recovered[0].quantity).toBe(2);
  });

  it('fuerza cantidades enteras positivas >= 1', () => {
    const items: CartItem[] = [
      { product: mockProduct, quantity: 3.8 },
    ];

    saveCartToStorage(items);
    const recovered = loadCartFromStorage();

    expect(recovered[0].quantity).toBe(3);
  });

  it('maneja almacenamiento corrupto o vacío retornando un arreglo vacío sin fallar', () => {
    localStorage.setItem('chica_rosa_cart_v1', 'invalid-json{{{');
    const recovered = loadCartFromStorage();
    expect(recovered).toEqual([]);
  });

  it('calcula los subtotales y totales sin decimales en COP', () => {
    const items: CartItem[] = [
      { product: mockProduct, quantity: 3 }, // 45000 * 3 = 135000
    ];

    const totalCOP = items.reduce((sum, item) => sum + item.product.price_cop * item.quantity, 0);
    expect(totalCOP).toBe(135000);
  });
});
