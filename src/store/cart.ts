import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { CartItem, Product, ProductListItem } from "@/types";

const CART_STORAGE_KEY = "mini-betta-cart";

function cartProduct(product: Product): ProductListItem {
  const image = product.images.find((item) =>
    item && !item.startsWith("data:") && !item.startsWith("blob:"),
  );

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice,
    species: product.species,
    color: product.color,
    stockStatus: product.stockStatus,
    images: [image || "/assets/bettafishgold.png"],
    badge: product.badge,
    difficultyLevel: product.difficultyLevel,
  };
}

function isQuotaError(error: unknown) {
  return error instanceof DOMException && (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  );
}

// A previous cart may contain full product records or base64 images. If that
// old value fills localStorage, remove only the cart key and retry with the
// compact payload. The in-memory cart still works if the browser blocks storage.
const resilientStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      if (!isQuotaError(error)) throw error;
      localStorage.removeItem(name);
      try {
        localStorage.setItem(name, value);
      } catch (retryError) {
        console.warn("Cart could not be persisted; using in-memory state", retryError);
      }
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) return;
        set({ items: [...items, { product: cartProduct(product), quantity: 1 }] });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => resilientStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const persisted = persistedState as { items?: CartItem[] } | undefined;
        const items = Array.isArray(persisted?.items)
          ? persisted.items
              .filter((item) => item?.product?.id && Number(item.quantity) > 0)
              .map((item) => ({
                product: cartProduct(item.product as Product),
                quantity: Math.max(1, Math.floor(Number(item.quantity))),
              }))
          : [];
        return { items };
      },
    },
  ),
);
