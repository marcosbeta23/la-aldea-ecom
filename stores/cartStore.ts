import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/database';

// Cart item extends product with quantity
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // For cart drawer/modal
  
  // Actions - return result for stock validation feedback
  addItem: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  
  // Computed (as functions for reactivity)
  getItemCount: () => number;
  getSubtotal: () => number;
  getItem: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);

        // Check if product is out of stock
        if (product.stock <= 0) {
          return { success: false, message: 'Producto sin stock disponible' };
        }

        // Calculate total quantity (existing + new)
        const currentQty = existingItem?.quantity || 0;
        const totalQty = currentQty + quantity;

        // Validate against available stock
        if (totalQty > product.stock) {
          const canAdd = product.stock - currentQty;
          if (canAdd <= 0) {
            return { success: false, message: `Ya tenés el máximo disponible (${product.stock} unidades)` };
          }
          return { success: false, message: `Solo podés agregar ${canAdd} más (stock: ${product.stock})` };
        }

        if (existingItem) {
          // Update quantity if already in cart
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Add new item
          set({ items: [...items, { product, quantity }] });
        }
        
        return { success: true };
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // Remove if quantity is 0 or less
          get().removeItem(productId);
          return { success: true };
        }

        const item = get().items.find((i) => i.product.id === productId);
        if (!item) {
          return { success: false, message: 'Producto no encontrado en el carrito' };
        }

        // Validate against available stock
        if (quantity > item.product.stock) {
          return { success: false, message: `Stock máximo disponible: ${item.product.stock} unidades` };
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
        
        return { success: true };
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      setCartOpen: (open) => {
        set({ isOpen: open });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price_numeric * item.quantity,
          0
        );
      },

      getItem: (productId) => {
        return get().items.find((item) => item.product.id === productId);
      },

      isInCart: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: 'la-aldea-cart', // localStorage key
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Helper hook for cart count (for Header badge)
export const useCartCount = () => useCartStore((state) => state.getItemCount());

// Helper hook for subtotal
export const useCartSubtotal = () => useCartStore((state) => state.getSubtotal());
