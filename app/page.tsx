import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Feather, ShieldCheck, Phone, CheckCircle2, MessageCircle } from 'lucide-react';
import { getFeaturedProducts, getAllCategories, getAllProducts, getSettings } from '@/lib/db';
import { cleanWhatsAppNumber } from '@/lib/format';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import FlashSaleBanner from '@/components/FlashSaleBanner';
import CollectibleVouchers from '@/components/CollectibleVouchers';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const settings = getSettings();
  const featuredProducts = getFeaturedProducts(4);
  const categories = getAllCategories({ hideEmpty: true });
  const allProducts = getAllProducts({ limit: 4 });
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProducts;

  const whatsapp = settings.whatsapp_number || '0313-5209085';
  const cleanPhone = cleanWhatsAppNumber(whatsapp);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-stone-900 text-white min-h-[580px] sm:min-h-[640px] flex items-center">
        {/* Background Image with Atmospheric Luxury Filter */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1800&auto=format&fit=crop"
            alt="Shawl Ghar Handcrafted Shawls"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-900/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-widest uppercase text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.site_name || 'Shawl Ghar'} • Winter 2026 Collection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              The Timeless Heritage of Handcrafted Kashmiri Shawls.
            </h1>

            <p className="text-base sm:text-lg text-stone-300 font-light leading-relaxed">
              Elevate your winter elegance with authentic Changthangi cashmere, exquisite Kashmiri needle embroidery, and traditional Swati wool wraps. Handcrafted on heritage looms with nationwide Cash on Delivery.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-emerald-900/40 flex items-center gap-2 group cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp ({whatsapp})</span>
              </a>

              <Link
                href="/products"
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-xs border border-white/20 transition-all flex items-center gap-2"
              >
                <span>Browse Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Value Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Pure Natural Wool</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Authentic Hand Embroidery</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLASH SALE & COUNTDOWN BANNER (DARAZ PATTERN) */}
      <FlashSaleBanner />

      {/* COLLECTIBLE VOUCHERS (DARAZ PATTERN) */}
      <CollectibleVouchers />

      {/* 2. WHATSAPP FAST ORDER CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant WhatsApp Booking • Cash on Delivery</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Found a shawl you love? Send us a screenshot on WhatsApp!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              Our concierge team will confirm your order immediately and dispatch your package with fast insured shipping right to your doorstep.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp: {whatsapp}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-800">
              Artisanal Weaves
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs uppercase tracking-wider font-semibold text-stone-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-800">
              Hand-Selected Pieces
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Featured Masterpieces
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs uppercase tracking-wider font-semibold text-stone-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={settings.whatsapp_number}
              currencySymbol={settings.currency_symbol}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white text-xs font-semibold uppercase tracking-widest transition-all"
          >
            <span>View All {allProducts.length}+ Collection Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. CRAFTSMANSHIP & ATELIER STORY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white grid grid-cols-1 lg:grid-cols-2 border border-stone-800 shadow-xl">
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-400">
              The Loom &amp; Thread
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
              Hundreds of Hours in Every Thread.
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed font-light">
              Unlike mass machine manufacturing, {settings.site_name || 'Shawl Ghar'} partners directly with traditional master weavers. Every pashmina and stole is handcrafted using fine wool, combed cashmere, and authentic needlework that brings monarchical poise to your wardrobe.
            </p>

            <ul className="space-y-3 text-xs text-stone-300 pt-2">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Soft, lightweight, and deeply warming natural fiber weaves</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Royal wedding, evening wear, and everyday heritage designs</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Insured delivery with Cash on Delivery across all cities of Pakistan</span>
              </li>
            </ul>

            <div className="pt-4">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-emerald-400 hover:text-white transition-colors"
              >
                <span>Request Video Preview on WhatsApp ({whatsapp})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="relative min-h-[320px] lg:min-h-full rounded-2xl overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/products/shop-craft-feature.jpg"
              alt="Handcrafted Kashmiri Needle Embroidery Workshop"
              className="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
