import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import { catalogService } from '../src/services/catalogService';

describe('Security & Data Validation - Reglas de integridad del catálogo', () => {
  it('rechaza precios negativos en la actualización de precios', async () => {
    const res = await catalogService.updateProductPrice('demo-prod-01', -5000);
    expect(res.success).toBe(false);
    expect(res.error).toContain('mayor o igual a 0');
  });

  it('rechaza precios con coma flotante para prevenir errores de cálculo monetario', async () => {
    const res = await catalogService.updateProductPrice('demo-prod-01', 45000.75);
    expect(res.success).toBe(false);
    expect(res.error).toContain('entero');
  });

  it('rechaza precios promocionales anteriores que sean menores o iguales al precio de venta', async () => {
    const res = await catalogService.updateProductPrice('demo-prod-01', 50000, 40000);
    expect(res.success).toBe(false);
    expect(res.error).toContain('estrictamente mayor');
  });

  it('valida que el nombre de un producto no esté vacío', async () => {
    const res = await catalogService.saveProduct({
      name: '   ',
      price_cop: 50000,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('nombre');
  });

  it('limita el arreglo de imágenes a un máximo de 4 imágenes por producto', async () => {
    const res = await catalogService.saveProduct({
      name: 'Producto con muchas fotos',
      price_cop: 30000,
      image_urls: ['/1.webp', '/2.webp', '/3.webp', '/4.webp', '/5.webp', '/6.webp'],
    });

    expect(res.success).toBe(true);
    expect(res.product?.image_urls).toHaveLength(4);
  });
});
