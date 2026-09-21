"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client/browser";
import type { BlogPost, Category, Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.products
      .list({ pageSize: 100 })
      .then((response) => setProducts(response.data.data as Product[]))
      .catch(() => setError("Unable to load products"))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiClient.categories
      .list()
      .then((response) => setCategories(response.data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);
  return { categories, loading };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.products
      .getById(id)
      .then((response) => setProduct(response.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading };
}

export function useBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.blogs
      .list({ pageSize: 100 })
      .then((response) => setBlogs(response.data.data as BlogPost[]))
      .catch(() => setError("Unable to load blog posts"))
      .finally(() => setLoading(false));
  }, []);

  return { blogs, loading, error };
}
