'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Eye, MessageCircle, ArrowUpRight, ShoppingBag, Check } from 'lucide-react';
import { Product, formatPrice, buildWhatsAppLink } from '@/lib/format';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
  currencySymbol?: string;
}

export default function ProductCard({
  product,
  whatsappNumber = '0313-5209085',
  currencySymbol = 'Rs.',
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const formattedPrice = formatPrice(product.price, currencySymbol);
  const formattedComparePrice = product.compare_at_price
    ? formatPrice(product.compare_at_price, currencySymbol)
    : null;

  // WhatsApp pre-filled message in clean English
  const whatsappMsg = `Hello! I would like to order this handcrafted shawl from Shawl Ghar:\n\n*${product.name}*\nPrice: ${formattedPrice}\nLink: http://localhost:3000/products/${product.id}\n\nPlease share Cash on Delivery order confirmation details. Thank you!`;
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, whatsappMsg);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Container */}
      <div className="relative aspect-4/5 w-full bg-stone-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_featured === 1 && (
            <span className="inline-flex items-center gap-1 bg-stone-900/90 backdrop-blur-xs text-amber-300 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {discount && discount > 0 && (
            <span className="inline-flex items-center bg-rose-700 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
              Save {discount}%
            </span>
          )}
          {product.stock_status === 'low_stock' && (
            <span className="inline-flex items-center bg-amber-700 text-white text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
              Limited Edition
            </span>
          )}
        </div>

        {/* Quick View Button Overlay */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <Link
            href={`/products/${product.id}`}
            className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300 bg-white/95 text-stone-900 hover:bg-stone-900 hover:text-white px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect Weave</span>
          </Link>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category Tag */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="uppercase tracking-widest text-[10px] font-semibold text-amber-900 truncate max-w-[150px]">
              {product.category_name || 'Kashmiri Shawl'}
            </span>
            {product.origin && (
              <span className="text-[10px] text-stone-400 truncate max-w-[120px]">
                {product.origin}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
            <Link href={`/products/${product.id}`}>
              {product.name}
            </Link>
          </h3>

          {/* Material Tag */}
          {product.material && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-1">
              {product.material}
            </p>
          )}
        </div>

        {/* Pricing & Direct WhatsApp Order Action */}
        <div className="mt-4 pt-3 border-t border-stone-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-stone-950 font-serif">
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formattedComparePrice}
                </span>
              )}
            </div>
            <Link
              href={`/products/${product.id}`}
              className="text-stone-400 hover:text-stone-900 p-1"
              title="View full specs"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Primary Action: Add to Bag */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-900 hover:bg-amber-900 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{adding ? 'Adding...' : 'Add to Bag'}</span>
              </>
            )}
          </button>

          {/* Secondary Action: Direct WhatsApp Concierge */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl border border-emerald-600/40 text-emerald-800 hover:bg-emerald-50 text-[11px] font-semibold tracking-wide transition flex items-center justify-center gap-1.5 group/btn cursor-pointer"
          >
            <MessageCircle className="w-3 h-3 text-emerald-600 group-hover/btn:scale-110 transition-transform" />
            <span>Order via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
