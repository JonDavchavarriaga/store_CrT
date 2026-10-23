import { describe, it, expect } from 'vitest';
import { formatCOP, calculateDiscountPercentage, slugify } from '../src/lib/formatters';

describe('Formatters - Formateo de moneda y textos para Chica Rosa', () => {
  it('formatea montos enteros en pesos colombianos (COP) sin decimales', () => {
    const formatted = formatCOP(45000);
    // Intl.NumberFormat puede variar ligeramente entre plataformas en el espacio no separable
    expect(formatted.replace(/\s+/g, ' ')).toMatch(/\$\s?45\.000/);
  });

  it('maneja 0 y valores no numéricos sin romper la interfaz', () => {
    expect(formatCOP(0).replace(/\s+/g, ' ')).toMatch(/\$\s?0/);
    expect(formatCOP(NaN)).toBe('$ 0');
  });

  it('redondea flotantes a enteros para prevenir errores de redondeo en COP', () => {
    const formatted = formatCOP(54999.8);
    expect(formatted.replace(/\s+/g, ' ')).toMatch(/\$\s?55\.000/);
  });

  it('calcula porcentaje de descuento únicamente si el precio anterior es superior', () => {
    // Caso con descuento válido: 100000 anterior, 80000 actual -> 20%
    expect(calculateDiscountPercentage(80000, 100000)).toBe(20);

    // Caso donde el precio anterior es menor o igual -> null (no inventa promociones)
    expect(calculateDiscountPercentage(80000, 80000)).toBeNull();
    expect(calculateDiscountPercentage(90000, 80000)).toBeNull();
    expect(calculateDiscountPercentage(80000, null)).toBeNull();
  });

  it('genera slugs limpios para URLs normalizando acentos en español', () => {
    expect(slugify('Vestido Elegante Rosa')).toBe('vestido-elegante-rosa');
    expect(slugify('Pantalón Clásico & Cómodo!')).toBe('pantalon-clasico-comodo');
  });
});
