'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingThreshold = 5000;
  const isFreeShipping = subtotal >= shippingThreshold;
  const estimatedShipping = isFreeShipping ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - discount + estimatedShipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponMessage({ text: data.message || 'Invalid or expired coupon code', isError: true });
        setAppliedCoupon(null);
      } else {
        setCouponMessage({ text: data.message, isError: false });
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: data.discount });
      }
    } catch {
      setCouponMessage({ text: 'Failed to validate coupon code', isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-stone-900">Your Shopping Bag is Empty</h1>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            You haven&apos;t added any handcrafted Kashmiri shawls or stoles to your bag yet.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition shadow-sm"
        >
          <span>Explore Authentic Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">Shopping Bag</h1>
        <p className="text-xs uppercase tracking-wider text-stone-500 mt-1">
          Review your selection of artisanal handcrafted shawls
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Items List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs divide-y divide-stone-100">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-serif font-bold text-stone-900 text-base hover:text-amber-800 transition line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs font-mono text-stone-400">SKU: SG-{item.product_id}</div>
                    <div className="text-xs font-bold text-stone-900">{formatPrice(item.unit_price)} each</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-l-lg transition"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold font-mono text-stone-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-r-lg transition"
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-sm font-bold text-stone-900 font-mono min-w-24 text-right">
                    {formatPrice(item.total_price)}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-stone-300 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-3">
              <Truck className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-stone-900">Nationwide Delivery</div>
                <div className="text-[11px] text-stone-400">TCS / Leopards Courier</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-stone-900">Cash on Delivery</div>
                <div className="text-[11px] text-stone-400">Pay at your doorstep</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-stone-900">7-Day Guarantee</div>
                <div className="text-[11px] text-stone-400">Authentic needlework</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Coupon (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <h2 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            {/* Subtotals breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-stone-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-mono font-bold text-stone-900">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon.code})</span>
                  </span>
                  <span className="font-mono">-{formatPrice(appliedCoupon.discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-stone-600">
                <span>Estimated Shipping</span>
                <span className="font-mono">
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">Free</span>
                  ) : (
                    formatPrice(estimatedShipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-base font-bold text-stone-900">
                <span>Grand Total</span>
                <span className="font-mono text-lg text-amber-900">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-stone-100">
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Promo / Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, WINTER500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 uppercase font-mono tracking-wider focus:outline-none focus:border-stone-800"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              </form>

              {couponMessage && (
                <div className={`mt-2 text-xs p-2.5 rounded-lg flex items-center gap-2 ${couponMessage.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  {couponMessage.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{couponMessage.text}</span>
                </div>
              )}
            </div>

            {/* Checkout Action Button */}
            <div className="space-y-2 pt-2">
              <Link
                href={`/checkout${appliedCoupon ? `?coupon=${encodeURIComponent(appliedCoupon.code)}` : ''}`}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition shadow-sm flex items-center justify-center gap-2 text-center"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-stone-400 text-center">
                Secure checkout with Cash on Delivery or Bank Transfer
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
