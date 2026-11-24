import React from 'react';
import Link from 'next/link';
import { getAllCategories, getSettings } from '@/lib/db';
import CategoryCard from '@/components/CategoryCard';

export const dynamic = 'force-dynamic';

export default function CategoriesPage() {
  const categories = getAllCategories({ hideEmpty: true });
  const settings = getSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* Header & Breadcrumb */}
      <div className="space-y-3 border-b border-stone-200 pb-8">
        <nav className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-stone-900 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Artisanal Collections</span>
        </nav>

        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            {settings.site_name || 'Shawl Ghar'} Collections &amp; Weaves
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-2xl">
            Each collection represents a distinct regional heritage, fiber grading, and loom tradition.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

    </div>
  );
}
