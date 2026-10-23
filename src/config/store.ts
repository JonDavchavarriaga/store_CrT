/**
 * CHICA ROSA - CONFIGURACIÓN CENTRALIZADA
 * 
 * Todos los parámetros comerciales, textos clave y validaciones de canal.
 * Modificar aquí sin necesidad de tocar componentes individuales.
 */

export interface WhatsAppValidation {
  isValid: boolean;
  isPlaceholder: boolean;
  formattedNumber: string;
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * Valida un número internacional de WhatsApp.
 * Para Colombia: código 57 + 10 dígitos celulares (12 dígitos en total, ej. 573114677311).
 */
export function validateWhatsAppNumber(rawNumber: string): WhatsAppValidation {
  // Limpiar cualquier carácter no numérico
  const digits = (rawNumber || '').replace(/\D/g, '');

  if (!digits || digits.length < 10) {
    return {
      isValid: false,
      isPlaceholder: false,
      formattedNumber: digits,
      errorMessage: 'El número de WhatsApp configurado es demasiado corto o inválido.'
    };
  }

  // Si tiene 10 dígitos y empieza por 3 (celular Colombia sin código de país)
  if (digits.length === 10 && digits.startsWith('3')) {
    return {
      isValid: true,
      isPlaceholder: false,
      formattedNumber: `57${digits}`,
      warningMessage: 'Se añadió automáticamente el código internacional de Colombia (57).'
    };
  }

  // Validación estándar internacional E.164 (11 a 15 dígitos)
  if (digits.length >= 11 && digits.length <= 15) {
    return {
      isValid: true,
      isPlaceholder: false,
      formattedNumber: digits
    };
  }

  return {
    isValid: false,
    isPlaceholder: false,
    formattedNumber: digits,
    errorMessage: `El número ${digits} no cumple con el formato internacional esperado (11 a 15 dígitos).`
  };
}

// Variables de entorno con valores por defecto seguros
const envWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || '573114677311';

export const STORE_CONFIG = {
  name: import.meta.env.VITE_STORE_NAME || 'Chica Rosa',
  tagline: 'Delicadeza, estilo y moda pensados para ti',
  country: 'Colombia',
  currency: 'COP',
  currencySymbol: '$',
  
  // WhatsApp
  whatsappNumberRaw: envWhatsApp,
  whatsappValidation: validateWhatsAppNumber(envWhatsApp),

  // Identidad visual
  logoUrl: '/logo/chica-rosa-logo.svg',
  logoAlt: 'Logo oficial de Chica Rosa',
  placeholderImageUrl: '/images/placeholders/product-placeholder.svg',

  // Textos comerciales informativos (sin falsas promesas)
  commercialInfo: {
    orderNote: 'Los pedidos preparados en el carrito se envían directamente a WhatsApp para verificar disponibilidad de inventario y confirmar el valor definitivo.',
    shippingNote: 'Envíos a todo el territorio nacional de Colombia con pago acordado con la tienda.',
    hoursNote: 'Atención personalizada de lunes a sábado vía WhatsApp.',
  },

  // Redes o contacto
  instagramHandle: '@chicarosa.col',
};
