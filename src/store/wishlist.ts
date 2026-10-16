import { create } from "zustand";
import type { Product } from "@/types";

interface WishlistStore {
  products: Product[];
  loaded: boolean;
  loading: boolean;
  authenticated: boolean;
  error: string;
  load: () => Promise<void>;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  reset: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  products: [],
  loaded: false,
  loading: false,
  authenticated: false,
  error: "",
  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: "" });
    try {
      const response = await fetch("/api/customer/wishlist", { cache: "no-store" });
      if (response.status === 401) {
        set({ products: [], loaded: true, loading: false, authenticated: false });
        return;
      }
      const body = await response.json() as { success?: boolean; data?: Product[]; message?: string };
      if (!response.ok || !body.success || !Array.isArray(body.data)) {
        throw new Error(body.message || "โหลดรายการที่ชอบไม่สำเร็จ");
      }
      set({ products: body.data, loaded: true, loading: false, authenticated: true });
    } catch (error) {
      set({ loaded: true, loading: false, authenticated: false, error: error instanceof Error ? error.message : "โหลดรายการที่ชอบไม่สำเร็จ" });
    }
  },
  add: (product) => set((state) => state.products.some((item) => item.id === product.id)
    ? state
    : { products: [product, ...state.products] }),
  remove: (productId) => set((state) => ({ products: state.products.filter((item) => item.id !== productId) })),
  reset: () => set({ products: [], loaded: false, loading: false, authenticated: false, error: "" }),
}));
