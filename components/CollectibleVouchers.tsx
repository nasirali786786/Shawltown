'use client';

import React, { useState } from 'react';
import { Tag, Check, Copy, Percent, Sparkles, Banknote } from 'lucide-react';

const VOUCHERS = [
  {
    code: 'WELCOME10',
    title: '10% Welcome Discount',
    desc: 'On all handcrafted Kashmiri shawls & stoles (Min. Rs. 2,000)',
    type: 'percent',
    badge: '10% OFF',
  },
  {
    code: 'WINTER500',
    title: 'Flat Rs. 500 Winter Relief',
    desc: 'Instant deduction on orders above Rs. 4,000',
    type: 'fixed',
    badge: 'Rs. 500 OFF',
  },
  {
    code: 'ROYALSHAWL',
    title: '15% Luxury Pashmina Offer',
    desc: 'For bridal heirloom weaves & luxury pashmina (Min. Rs. 8,000)',
    type: 'percent',
    badge: '15% OFF',
  },
];

export default function CollectibleVouchers() {
  const [collected, setCollected] = useState<Record<string, boolean>>({});

  const handleCollect = (code: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      localStorage.setItem('shawlghar_collected_coupon', code);
    } catch {}

    setCollected((prev) => ({ ...prev, [code]: true }));
    setTimeout(() => {
      // keep it collected
    }, 2000);
  };

  return (
    <section className="py-8 bg-stone-50 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-800 text-white flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                Exclusive Daraz-Style Store Vouchers
              </h2>
              <p className="text-xs text-stone-500">
                Tap &ldquo;Collect Voucher&rdquo; to auto-apply discount at checkout.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Limited Daily Allotment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VOUCHERS.map((v) => {
            const isDone = collected[v.code];

            return (
              <div
                key={v.code}
                className="relative bg-white border border-dashed border-amber-800/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md transition group"
              >
                {/* Decorative Side Cutouts */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-50 border-r border-amber-800/30" />
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-50 border-l border-amber-800/30" />

                <div className="space-y-1 pl-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 font-mono">
                    {v.badge}
                  </span>
                  <div className="font-mono font-bold text-sm text-stone-900 tracking-wider">
                    {v.code}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug line-clamp-1">{v.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCollect(v.code)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer shadow-xs ${
                    isDone
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-900 hover:bg-amber-900 text-white'
                  }`}
                >
                  {isDone ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Collected
                    </span>
                  ) : (
                    <span>Collect</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
