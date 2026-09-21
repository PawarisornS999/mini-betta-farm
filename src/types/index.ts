// ==========================================
// 🐟 Aurora Betta Farm — Shared Domain Types
// ==========================================
// Maps 1:1 to database schema (PostgreSQL)
// Used by: web, admin, api, api-client
// ==========================================

// ─── Enums ───────────────────────────────

export type UserRole = "customer" | "admin";

export type Species =
  | "Halfmoon"
  | "Crowntail"
  | "Plakat"
  | "Giant"
  | "Giant Betta"
  | "Double Tail"
  | "Dumbo Ear"
  | "Wild Type"
  | "Koi";

export type DifficultyLevel = "beginner" | "medium" | "advanced";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type BlogCategory =
  | "care-guide"
  | "disease"
  | "species"
  | "breeding"
  | "equipment"
  | "news"
  | "Care Guide"
  | "Health"
  | "Species"
  | "Breeding"
  | "Equipment"
  | "Education";

// ─── Users ───────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  lineId?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Products (Betta Fish) ───────────────

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  description: string;
  species: Species;
  color: string;
  difficultyLevel?: DifficultyLevel;
  stockQty?: number;
  stockStatus: StockStatus;
  waterTempMin?: number;
  waterTempMax?: number;
  difficulty?: Difficulty;
  waterTemp?: string;
  stock?: StockStatus;
  feedingNotes: string;
  images: string[];
  badge?: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  sku?: string;
  category?: string;
  gender?: "male" | "female" | "unsexed";
  pattern?: string;
  tailType?: string;
  ageMonths?: number;
  sizeCm?: number;
  cost?: number;
  reservedQty?: number;
  adminStatus?: "draft" | "available" | "reserved" | "sold" | "hidden";
}

export type ProductListItem = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "originalPrice"
  | "species"
  | "color"
  | "stockStatus"
  | "images"
  | "badge"
  | "difficultyLevel"
>;

// ─── Categories ──────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  isActive?: boolean;
  sortOrder?: number;
}

// ─── Blog ────────────────────────────────

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: BlogCategory;
  tags?: string[];
  author: string;
  readTime: number | string;
  seoTitle?: string;
  seoDescription?: string;
  date?: string;
  seo?: {
    title: string;
    description: string;
  };
  relatedSlugs: string[];
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BlogListItem = Pick<
  BlogPost,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "coverImage"
  | "category"
  | "readTime"
  | "createdAt"
>;

// ─── Cart ────────────────────────────────

export interface CartItem {
  product: ProductListItem;
  quantity: number;
}

// ─── Orders ──────────────────────────────

export interface Order {
  id: string;
  customerToken?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  totalPrice?: number;
  subtotal?: number;
  shippingFee?: number;
  shippingQuoted?: boolean;
  paymentStatus?: "pending" | "awaiting_slip" | "slip_submitted" | "paid" | "rejected" | "failed" | "refunded";
  shippingStatus?: "pending" | "ready_to_ship" | "shipped" | "delivered" | "returned";
  trackingNumber?: string;
  slipPath?: string;
  lineUserId?: string;
  reservationExpiresAt?: string;
  total?: number;
  status: OrderStatus;
  lineMessage?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId?: string;
  productName?: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    [key: string]: unknown;
  };
  quantity: number;
  price?: number;
}

// ─── Inventory Logs ──────────────────────

export interface InventoryLog {
  id: string;
  productId: string;
  changeQty: number;
  reason: string;
  createdBy?: string;
  createdAt: string;
}

// ─── API Request/Response ────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

// ─── Filter/Query Params ─────────────────

export interface ProductFilters {
  search?: string;
  species?: Species;
  color?: string;
  difficultyLevel?: DifficultyLevel;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: StockStatus;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "price" | "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface BlogFilters {
  search?: string;
  category?: BlogCategory;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── Checkout ────────────────────────────

export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

export interface LineOrderPayload {
  orderId: string;
}
