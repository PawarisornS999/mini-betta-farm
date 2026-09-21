// ─── JSON-LD Structured Data components for SEO ───────────────────────────────
// Used in product and blog pages for Google rich results

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string;
  price: number;
  availability: "InStock" | "OutOfStock" | "LimitedAvailability";
  url: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  availability,
  url,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    url,
    brand: {
      "@type": "Brand",
      name: "Aurora Betta Farm",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "Aurora Betta Farm",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Article JSON-LD (Blog Posts) ────────────────────────────────────────────

interface ArticleJsonLdProps {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}

export function ArticleJsonLd({
  title,
  description,
  image,
  url,
  datePublished,
  dateModified,
  author = "Aurora Betta Farm",
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Organization",
      name: author,
      url: "https://minibettafarm.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Aurora Betta Farm",
      logo: {
        "@type": "ImageObject",
        url: "https://minibettafarm.com/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Organization JSON-LD ─────────────────────────────────────────────────────

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aurora Betta Farm",
    url: "https://minibettafarm.com",
    logo: "https://minibettafarm.com/logo.png",
    sameAs: [
      "https://www.facebook.com/minibettafarm",
      "https://www.instagram.com/minibettafarm",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+66-xx-xxx-xxxx",
      contactType: "customer service",
      availableLanguage: ["Thai", "English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── BreadcrumbList JSON-LD ───────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
