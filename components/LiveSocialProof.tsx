'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShieldCheck, MapPin } from 'lucide-react';

interface RecentOrderEvent {
  buyer: string;
  city: string;
  productId: number;
  productName: string;
  imageUrl: string;
  timeAgo: string;
}

const RECENT_EVENTS: RecentOrderEvent[] = [
  {
    buyer: 'Fatima Z.',
    city: 'DHA, Lahore',
    productId: 52,
    productName: 'Royal Handcrafted Kashmiri Toosha Wool Stole',
    imageUrl: '/images/products/toosha-stole-1.jpg',
    timeAgo: '14 mins ago',
  },
  {
    buyer: 'Dr. Ayesha M.',
    city: 'Sector F-7, Islamabad',
    productId: 48,
    productName: 'Exclusive Handmade Aari Work Pure Woolen Shawl',
    imageUrl: '/images/products/aari-work-shawl-1.jpg',
    timeAgo: '27 mins ago',
  },
  {
    buyer: 'Sana Tariq',
    city: 'Clifton, Karachi',
    productId: 51,
    productName: 'Exclusive Handmade Sui Ka Kaam Kashmiri Shawl',
    imageUrl: '/images/products/sui-ka-kaam-1.jpg',
    timeAgo: '42 mins ago',
  },
  {
    buyer: 'Hamza K.',
    city: 'Bahria Town, Rawalpindi',
    productId: 49,
    productName: 'Exclusive Kashmiri Kingri Shawl',
    imageUrl: '/images/products/kingri-shawl-1.jpg',
    timeAgo: '1 hour ago',
  },
  {
    buyer: 'Hina R.',
    city: 'University Town, Peshawar',
    productId: 55,
    productName: 'Stunning Maroon Handcrafted Kashmiri Wool Stole',
    imageUrl: '/images/products/maroon-stole-1.jpg',
    timeAgo: '2 hours ago',
  },
];

export default function LiveSocialProof() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (dismissed) return;

    // Show first subtle toast after 9 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 9000);

    return () => clearTimeout(initialTimer);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed || !visible) return;

    // Hide after 6.5s, then cycle to next item 22s later
    const hideTimer = setTimeout(() => {
      setVisible(false);
      const nextTimer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % RECENT_EVENTS.length);
        setVisible(true);
      }, 22000);
      return () => clearTimeout(nextTimer);
    }, 6500);

    return () => clearTimeout(hideTimer);
  }, [visible, index, dismissed]);

  if (dismissed || !visible) return null;

  const event = RECENT_EVENTS[index];

  return (
    <div className="hidden md:flex fixed bottom-6 left-6 z-40 max-w-xs bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl p-3 items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Link href={`/products/${event.productId}`} className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.imageUrl}
          alt={event.productName}
          className="w-12 h-14 rounded-xl object-cover border border-stone-200"
        />
      </Link>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>Verified COD Order</span>
        </div>
        <p className="text-[11px] text-stone-700 leading-snug mt-0.5">
          <strong>{event.buyer}</strong> ordered{' '}
          <Link
            href={`/products/${event.productId}`}
            className="font-serif font-bold text-amber-900 hover:underline line-clamp-1"
          >
            {event.productName}
          </Link>
        </p>
        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {event.city}
          </span>
          <span>&bull;</span>
          <span>{event.timeAgo}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss recent order notification"
        className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-700 rounded-full transition cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
