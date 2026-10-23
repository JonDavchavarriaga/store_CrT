import { describe, it, expect } from 'vitest';
import { validateWhatsAppNumber, STORE_CONFIG } from '../src/config/store';
import { buildWhatsAppOrderMessage, generateWhatsAppOrderUrl } from '../src/lib/whatsapp';
import type { CartItem } from '../src/types/cart';
import type { Product } from '../src/types/product';

const sampleProduct: Product = {
  id: 'prod-001',
  name: 'Vestido Rosa Palo',
  slug: 'vestido-rosa-palo',
  reference: 'CR-VES-001',
  description: 'Vestido elegante',
  price_cop: 50000,
  compare_at_price_cop: null,
  category_id: 'cat-01',
  image_urls: ['/img1.webp'],
  is_active: true,
  is_available: true,
  is_featured: false,
};

describe('WhatsApp Integration - Validación y generación de pedidos', () => {
  it('valida correctamente el número oficial de Chica Rosa (573114677311)', () => {
    const res = validateWhatsAppNumber('573114677311');
    expect(res.isValid).toBe(true);
    expect(res.formattedNumber).toBe('573114677311');
  });

  it('valida números de celular de Colombia de 10 dígitos y añade prefijo 57 automáticamente', () => {
    const res = validateWhatsAppNumber('3114677311');
    expect(res.isValid).toBe(true);
    expect(res.formattedNumber).toBe('573114677311');
  });

  it('acepta números internacionales completos válidos', () => {
    const res = validateWhatsAppNumber('573114677311');
    expect(res.isValid).toBe(true);
    expect(res.formattedNumber).toBe('573114677311');
  });

  it('rechaza números demasiado cortos o inválidos', () => {
    expect(validateWhatsAppNumber('12345').isValid).toBe(false);
    expect(validateWhatsAppNumber('').isValid).toBe(false);
  });

  it('construye el mensaje respetando el formato exacto requerido', () => {
    const items: CartItem[] = [
      { product: sampleProduct, quantity: 2 },
    ];

    const message = buildWhatsAppOrderMessage(items);
    expect(message).toContain(`Hola, ${STORE_CONFIG.name}. Quiero realizar el siguiente pedido:`);
    expect(message).toContain('1. Producto: Vestido Rosa Palo');
    expect(message).toContain('Referencia: CR-VES-001');
    expect(message).toContain('Cantidad: 2');
    expect(message).toContain('Quedo pendiente de la confirmación de disponibilidad');
  });

  it('omite del mensaje los productos inactivos o agotados', () => {
    const items: CartItem[] = [
      { product: sampleProduct, quantity: 1 },
      {
        product: { ...sampleProduct, id: 'prod-002', name: 'Agotado', is_available: false },
        quantity: 1,
      },
    ];

    const message = buildWhatsAppOrderMessage(items);
    expect(message).toContain('Vestido Rosa Palo');
    expect(message).not.toContain('Agotado');
  });

  it('genera un enlace wa.me correctamente codificado con encodeURIComponent', () => {
    const items: CartItem[] = [{ product: sampleProduct, quantity: 1 }];
    const res = generateWhatsAppOrderUrl(items, '573114677311');

    expect(res.url).toBeDefined();
    expect(res.url).toContain('https://wa.me/573114677311?text=');
    // Verificar que no contiene espacios sin codificar en la URL
    expect(res.url).not.toContain(' ');
  });

  it('bloquea la generación si el carrito está vacío', () => {
    const res = generateWhatsAppOrderUrl([], '573114677311');
    expect(res.url).toBeNull();
    expect(res.error).toBeDefined();
  });
});
