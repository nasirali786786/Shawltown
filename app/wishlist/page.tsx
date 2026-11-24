'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = async (product: any) => {
    await addToCart(product.id, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider">
        <Link href="/" className="hover:text-stone-900 transition">
          Home
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">My Wishlist</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 flex items-center gap-3">
            <span>Saved Artisan Shawls</span>
            <span className="text-sm font-sans font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              {wishlist.length} {wishlist.length === 1 ? 'Piece' : 'Pieces'}
            </span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Curate your favourite Kashmiri weaves, bridal wraps, and winter stoles.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="text-xs text-stone-500 hover:text-rose-600 transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Saved</span>
          </button>
        )}
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            You haven&apos;t saved any shawls yet. Browse our handcrafted Kashmiri collection and tap the heart icon on any piece to save it here.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md"
            >
              <span>Explore Shawl Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-4/5 w-full bg-stone-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.id)}
                  title="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-600 hover:bg-rose-50 shadow-md transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {item.is_featured === 1 && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 bg-stone-900/90 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                    {item.category_name || 'Kashmiri Weave'}
                  </span>
                  <h3 className="font-serif font-bold text-stone-900 text-sm mt-1 line-clamp-1 hover:text-amber-800 transition">
                    <Link href={`/products/${item.id}`}>{item.name}</Link>
                  </h3>
                  <div className="text-base font-bold text-stone-950 font-serif mt-1">
                    {formatPrice(item.price)}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleMoveToBag(item)}
                    className="w-full py-2.5 px-3 bg-stone-900 hover:bg-amber-900 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>

                  <Link
                    href={`/products/${item.id}`}
                    className="w-full py-1.5 text-center text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
