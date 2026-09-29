import type { Metadata } from "next";
import { getProduct } from "@/lib/supabase/queries";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/JsonLd";

const BASE_URL = "https://minibettafarm.com";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "ไม่พบสินค้า", robots: { index: false, follow: false } };
  const description = product.seoDescription ?? product.description.slice(0, 160);
  return {
    title: product.seoTitle ?? product.name,
    description,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      title: product.seoTitle ?? product.name,
      description,
      type: "website",
      url: `/shop/${product.id}`,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : [],
    },
    twitter: { card: "summary_large_image", images: product.images[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return children;
  const unavailable = product.adminStatus === "sold" || product.stockStatus === "out_of_stock";
  const url = `${BASE_URL}/shop/${product.id}`;
  return <>
    <ProductJsonLd name={product.name} description={product.description} image={product.images[0] ?? `${BASE_URL}/assets/bettaHMPKHero.png`} price={product.price} availability={unavailable ? "OutOfStock" : product.stockStatus === "low_stock" ? "LimitedAvailability" : "InStock"} url={url} />
    <BreadcrumbJsonLd items={[{ name: "หน้าแรก", url: BASE_URL }, { name: "ร้านค้า", url: `${BASE_URL}/shop` }, { name: product.name, url }]} />
    {children}
  </>;
}
