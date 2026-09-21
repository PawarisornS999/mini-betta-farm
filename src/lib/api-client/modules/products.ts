import type {
  Product,
  ProductListItem,
  ProductFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";
import type { ApiClient } from "../client";

export class ProductsApi {
  constructor(private client: ApiClient) {}

  async list(
    filters?: ProductFilters,
  ): Promise<ApiResponse<PaginatedResponse<ProductListItem>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.client.request(`/api/products${query}`);
  }

  async getById(id: string): Promise<ApiResponse<Product>> {
    return this.client.request(`/api/products/${id}`);
  }

  async getBySlug(slug: string): Promise<ApiResponse<Product>> {
    return this.client.request(`/api/products/slug/${slug}`);
  }

  async create(
    data: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Product>> {
    return this.client.request("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(
    id: string,
    data: Partial<Product>,
  ): Promise<ApiResponse<Product>> {
    return this.client.request(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.client.request(`/api/products/${id}`, { method: "DELETE" });
  }
}
