import type {
  BlogPost,
  BlogListItem,
  BlogFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";
import type { ApiClient } from "../client";

export class BlogsApi {
  constructor(private client: ApiClient) {}

  async list(
    filters?: BlogFilters,
  ): Promise<ApiResponse<PaginatedResponse<BlogListItem>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.client.request(`/api/blogs${query}`);
  }

  async getBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    return this.client.request(`/api/blogs/${slug}`);
  }

  async create(
    data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<BlogPost>> {
    return this.client.request("/api/blogs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(
    id: string,
    data: Partial<BlogPost>,
  ): Promise<ApiResponse<BlogPost>> {
    return this.client.request(`/api/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.client.request(`/api/blogs/${id}`, { method: "DELETE" });
  }
}
