import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getAllProducts, getSettings } from '@/lib/db';
import ProductDetailView from '@/components/ProductDetailView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) return {};

  const product = getProductById(productId);
  if (!product) return {};

  const settings = getSettings();
  const title = `${product.name} | ${settings.site_name || 'Shawl Ghar'}`;
  const description = `${product.short_description || product.description.slice(0, 155)} — 100% authentic Kashmiri weave with nationwide Cash on Delivery.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.image_url,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const product = getProductById(productId);
  if (!product) {
    notFound();
  }

  const settings = getSettings();

  // Fetch related products in same category or general collection
  const relatedProducts = getAllProducts({
    categoryId: product.category_id,
    limit: 4,
  }).filter((p) => p.id !== product.id);

  // Google Rich Snippets / Schema.org Product structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url,
    description: product.description,
    sku: `SG-00${product.id}`,
    category: product.category_name,
    material: product.material,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.price,
      availability:
        product.stock_status === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: settings.site_name || 'Shawl Ghar',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        whatsappNumber={settings.whatsapp_number}
        currencySymbol={settings.currency_symbol}
        siteName={settings.site_name}
      />
    </div>
  );
}
