import type {
  Order,
  OrderFilters,
  OrderStatus,
  CheckoutPayload,
  LineOrderPayload,
  PaginatedResponse,
  ApiResponse,
} from "@/types";
import type { ApiClient } from "../client";

export class OrdersApi {
  constructor(private client: ApiClient) {}

  async list(
    filters?: OrderFilters,
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.client.request(`/api/orders${query}`);
  }

  async getById(id: string): Promise<ApiResponse<Order>> {
    return this.client.request(`/api/orders/${id}`);
  }

  async checkout(data: CheckoutPayload): Promise<ApiResponse<Order>> {
    return this.client.request("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<ApiResponse<Order>> {
    return this.client.request(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async sendToLine(
    data: LineOrderPayload,
  ): Promise<ApiResponse<{ lineUrl: string; message: string }>> {
    return this.client.request("/api/orders/send-to-line", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
