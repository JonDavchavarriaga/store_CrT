import type { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number; // Entero positivo >= 1
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalCOP: number;
}
