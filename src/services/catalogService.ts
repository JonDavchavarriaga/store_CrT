import type { Category, Product } from '../types/product';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '../data/initialCatalog';

const LOCAL_PRODUCTS_KEY = 'chica_rosa_local_products_v1';
const LOCAL_CATEGORIES_KEY = 'chica_rosa_local_categories_v1';

// Cargar catálogo inicial persistido en localStorage para modo demo/desarrollo
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error leyendo productos locales:', err);
  }
  return DEMO_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Error guardando productos locales:', err);
  }
}

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error leyendo categorías locales:', err);
  }
  return DEMO_CATEGORIES;
}

export const catalogService = {
  /**
   * Obtiene todas las categorías activas
   */
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        return data as Category[];
      }
      console.warn('Supabase getCategories falló, usando datos locales:', error?.message);
    }
    return getLocalCategories();
  },

  /**
   * Obtiene todos los productos para la tienda pública (solo activos)
   */
  async getPublicProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Product[];
      }
      console.warn('Supabase getPublicProducts falló, usando datos locales:', error?.message);
    }
    return getLocalProducts().filter((p) => p.is_active);
  },

  /**
   * Obtiene todos los productos para el panel de administración (activos e inactivos)
   */
  async getAdminProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Product[];
      }
      console.warn('Supabase getAdminProducts falló, usando datos locales:', error?.message);
    }
    return getLocalProducts();
  },

  /**
   * Edición rápida de precio para un producto
   */
  async updateProductPrice(
    productId: string,
    newPriceCOP: number,
    compareAtPriceCOP: number | null = null
  ): Promise<{ success: boolean; error?: string; product?: Product }> {
    if (newPriceCOP < 0 || !Number.isInteger(newPriceCOP)) {
      return { success: false, error: 'El precio debe ser un número entero mayor o igual a 0.' };
    }

    if (compareAtPriceCOP !== null && compareAtPriceCOP <= newPriceCOP) {
      return {
        success: false,
        error: 'El precio anterior debe ser estrictamente mayor que el precio actual.',
      };
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({
          price_cop: newPriceCOP,
          compare_at_price_cop: compareAtPriceCOP,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, product: data as Product };
    }

    // Modo local / demo
    const current = getLocalProducts();
    const index = current.findIndex((p) => p.id === productId);
    if (index === -1) {
      return { success: false, error: 'Producto no encontrado.' };
    }

    const updated: Product = {
      ...current[index],
      price_cop: newPriceCOP,
      compare_at_price_cop: compareAtPriceCOP,
      updated_at: new Date().toISOString(),
    };

    current[index] = updated;
    saveLocalProducts(current);
    return { success: true, product: updated };
  },

  /**
   * Actualiza el estado de disponibilidad o visibilidad de un producto
   */
  async toggleProductStatus(
    productId: string,
    field: 'is_active' | 'is_available' | 'is_featured',
    value: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    const current = getLocalProducts();
    const item = current.find((p) => p.id === productId);
    if (item) {
      item[field] = value;
      item.updated_at = new Date().toISOString();
      saveLocalProducts(current);
    }
    return { success: true };
  },

  /**
   * Guarda o crea un producto completo
   */
  async saveProduct(product: Partial<Product>): Promise<{ success: boolean; error?: string; product?: Product }> {
    if (!product.name || !product.name.trim()) {
      return { success: false, error: 'El nombre del producto es obligatorio.' };
    }
    if (product.price_cop === undefined || product.price_cop < 0) {
      return { success: false, error: 'El precio debe ser un número entero no negativo en COP.' };
    }

    const cleanImageUrls = (product.image_urls || [])
      .filter((url) => typeof url === 'string' && url.trim().length > 0)
      .slice(0, 4);

    const payload = {
      name: product.name.trim(),
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      reference: product.reference?.trim() || null,
      description: product.description?.trim() || '',
      price_cop: Math.round(product.price_cop),
      compare_at_price_cop: product.compare_at_price_cop ? Math.round(product.compare_at_price_cop) : null,
      category_id: product.category_id || '',
      image_urls: cleanImageUrls,
      is_active: product.is_active ?? true,
      is_available: product.is_available ?? true,
      is_featured: product.is_featured ?? false,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      if (product.id) {
        const { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id)
          .select()
          .single();

        if (!error && data) {
          return { success: true, product: data as Product };
        }
        console.warn('Supabase update falló o tabla no migrada, guardando localmente:', error?.message);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          return { success: true, product: data as Product };
        }
        console.warn('Supabase insert falló o tabla no migrada, guardando localmente:', error?.message);
      }
    }

    // Modo local / demo
    const current = getLocalProducts();
    if (product.id) {
      const index = current.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        const updated = { ...current[index], ...payload, id: product.id } as Product;
        current[index] = updated;
        saveLocalProducts(current);
        return { success: true, product: updated };
      }
    }

    const newProd: Product = {
      ...payload,
      id: `prod-local-${Date.now()}`,
      created_at: new Date().toISOString(),
    } as Product;
    current.unshift(newProd);
    saveLocalProducts(current);
    return { success: true, product: newProd };
  },

  /**
   * Elimina un producto (o lo desactiva lógicamente)
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    const current = getLocalProducts().filter((p) => p.id !== productId);
    saveLocalProducts(current);
    return { success: true };
  },
};
