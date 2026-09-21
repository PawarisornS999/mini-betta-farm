import type { ApiResponse, Category } from "@/types";
import type { ApiClient } from "../client";

export class CategoriesApi {
  constructor(private client: ApiClient) {}
  async list(): Promise<ApiResponse<Category[]>> {
    return this.client.request("/api/categories");
  }
}
