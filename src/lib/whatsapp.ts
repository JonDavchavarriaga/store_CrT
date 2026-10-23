import type { CartItem } from '../types/cart';
import { formatCOP } from './formatters';
import { STORE_CONFIG, validateWhatsAppNumber } from '../config/store';

export interface WhatsAppOrderResult {
  url: string | null;
  messageText: string;
  error?: string;
  warning?: string;
}

/**
 * Genera el texto del mensaje para enviar el pedido a WhatsApp
 */
export function buildWhatsAppOrderMessage(items: CartItem[]): string {
  // Filtrar ítems válidos (activos, disponibles y con cantidad > 0)
  const validItems = items.filter(
    (item) => item.product.is_active && item.product.is_available && item.quantity > 0
  );

  if (validItems.length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push(`Hola, ${STORE_CONFIG.name}. Quiero realizar el siguiente pedido:`);
  lines.push('');

  let totalCOP = 0;

  validItems.forEach((item, index) => {
    const itemSubtotal = item.product.price_cop * item.quantity;
    totalCOP += itemSubtotal;

    const refText = item.product.reference ? `\n   Referencia: ${item.product.reference}` : '';

    lines.push(
      `${index + 1}. Producto: ${item.product.name}${refText}\n   Cantidad: ${item.quantity}\n   Precio unitario: ${formatCOP(item.product.price_cop)}\n   Subtotal: ${formatCOP(itemSubtotal)}`
    );
    lines.push('');
  });

  lines.push(`Total estimado: ${formatCOP(totalCOP)}`);
  lines.push('');
  lines.push('Quedo pendiente de la confirmación de disponibilidad y del valor definitivo del pedido. ¡Gracias!');

  return lines.join('\n');
}

/**
 * Construye la URL completa de WhatsApp con validación rigurosa de número
 */
export function generateWhatsAppOrderUrl(items: CartItem[], customNumber?: string): WhatsAppOrderResult {
  const numberToUse = customNumber || STORE_CONFIG.whatsappNumberRaw;
  const validation = validateWhatsAppNumber(numberToUse);

  if (!validation.isValid) {
    return {
      url: null,
      messageText: '',
      error: validation.errorMessage || 'Número de WhatsApp inválido.',
      warning: validation.warningMessage,
    };
  }

  const validItems = items.filter(
    (item) => item.product.is_active && item.product.is_available && item.quantity > 0
  );

  if (validItems.length === 0) {
    return {
      url: null,
      messageText: '',
      error: 'El carrito no contiene productos válidos y disponibles para ordenar.',
    };
  }

  const messageText = buildWhatsAppOrderMessage(validItems);
  const encodedText = encodeURIComponent(messageText);
  const finalUrl = `https://wa.me/${validation.formattedNumber}?text=${encodedText}`;

  return {
    url: finalUrl,
    messageText,
    warning: validation.warningMessage,
  };
}
