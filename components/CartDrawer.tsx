'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();

  if (!isDrawerOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-stone-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-stone-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
                <h2 className="text-lg font-serif font-bold text-stone-900 tracking-wide">
                  Your Shopping Bag ({cart?.item_count || 0})
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                aria-label="Close bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                {remainingForFreeShipping > 0 ? (
                  <span className="text-stone-600 font-medium">
                    Add <strong className="text-amber-800">{formatPrice(remainingForFreeShipping)}</strong> more for <strong>Free Delivery</strong>!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Unlocked Free Nationwide Delivery!</span>
                  </span>
                )}
                <span className="text-stone-400 font-mono text-[11px]">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-700 rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-stone-800 text-lg">Your bag is currently empty</p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore our authentic Kashmiri needlework shawls and pure wool stoles.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={closeDrawer}
                  className="inline-block px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg border border-stone-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product_id}`}
                          onClick={closeDrawer}
                          className="font-serif font-bold text-stone-900 text-sm hover:text-amber-800 transition line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-300 hover:text-rose-600 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs font-bold text-amber-900 mt-1">
                        {formatPrice(item.unit_price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-l-lg transition"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-r-lg transition"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-stone-900 font-mono">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-stone-200 space-y-4 shadow-lg">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between items-center text-sm font-bold text-stone-900">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-stone-500">
                  <span>Shipping &amp; Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full py-3 text-center border border-stone-300 rounded-xl text-xs font-semibold uppercase tracking-wider text-stone-800 hover:bg-stone-50 transition"
                >
                  View Full Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash on Delivery (COD) &amp; Bank Transfer Available</span>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
