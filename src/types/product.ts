/**
 * Tipos de datos para el catálogo de Chica Rosa
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  display_order?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  reference: string | null;
  description: string;
  price_cop: number;                 // Entero positivo en COP
  compare_at_price_cop: number | null;// Precio anterior para rebajas (debe ser mayor a price_cop)
  category_id: string;
  category?: Category;
  image_urls: string[];              // Hasta 4 imágenes ordenadas
  is_active: boolean;                // Visible en catálogo público
  is_available: boolean;             // Disponible para pedir (no agotado)
  is_featured: boolean;              // Destacado en home
  created_at?: string;
  updated_at?: string;
}

export type ProductSortOption = 
  | 'featured'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc';

export interface ProductFilters {
  categoryId: string | null;
  searchQuery: string;
  sortBy: ProductSortOption;
}
