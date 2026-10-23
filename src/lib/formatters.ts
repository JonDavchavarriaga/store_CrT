/**
 * Utilidades de formateo para Chica Rosa
 */

/**
 * Formatea un número entero a pesos colombianos (COP).
 * Ejemplo: 45000 -> "$ 45.000"
 */
export function formatCOP(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$ 0';
  }

  // Redondear a entero para evitar problemas de coma flotante
  const safeInt = Math.max(0, Math.round(amount));

  // Formateador con configuración estándar para Colombia
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return formatter.format(safeInt);
}

/**
 * Calcula el porcentaje de descuento si existe un precio anterior válido.
 * Solo se muestra si comparePrice es estrictamente mayor que currentPrice.
 */
export function calculateDiscountPercentage(currentPrice: number, comparePrice: number | null | undefined): number | null {
  if (!comparePrice || comparePrice <= currentPrice || currentPrice <= 0) {
    return null;
  }

  const discount = Math.round(((comparePrice - currentPrice) / comparePrice) * 100);
  return discount > 0 ? discount : null;
}

/**
 * Convierte un texto en un slug amigable para URLs.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
