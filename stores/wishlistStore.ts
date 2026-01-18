import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // Array of product IDs
  
  // Actions
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  clearWishlist: () => void;
  
  // Computed
  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        const { items } = get();
        if (!items.includes(productId)) {
          set({ items: [...items, productId] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((id) => id !== productId),
        });
      },

      toggleItem: (productId) => {
        const { items, addItem, removeItem } = get();
        if (items.includes(productId)) {
          removeItem(productId);
        } else {
          addItem(productId);
        }
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },

      getCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'la-aldea-wishlist', // localStorage key
    }
  )
);

// Helper hook for wishlist count
export const useWishlistCount = () => useWishlistStore((state) => state.items.length);
