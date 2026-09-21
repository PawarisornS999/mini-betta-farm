import type { ApiResponse, ApiError } from "@/types";
import { ProductsApi } from "./modules/products";
import { BlogsApi } from "./modules/blogs";
import { OrdersApi } from "./modules/orders";
import { CategoriesApi } from "./modules/categories";

export interface ApiClientConfig {
  baseUrl: string;
  token?: string;
}

export class ApiClient {
  private config: ApiClientConfig;
  public products: ProductsApi;
  public blogs: BlogsApi;
  public orders: OrdersApi;
  public categories: CategoriesApi;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.products = new ProductsApi(this);
    this.blogs = new BlogsApi(this);
    this.orders = new OrdersApi(this);
    this.categories = new CategoriesApi(this);
  }

  setToken(token: string) {
    this.config.token = token;
  }

  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.config.token) {
      headers["Authorization"] = `Bearer ${this.config.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error: ApiError = await res.json().catch(() => ({
        success: false,
        message: `HTTP ${res.status}: ${res.statusText}`,
        code: "HTTP_ERROR",
      }));
      throw error;
    }

    return res.json();
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
