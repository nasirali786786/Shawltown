'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, Sparkles, ArrowRight, Tag } from 'lucide-react';

export default function FlashSaleBanner() {
  // Countdown to next 48 hours
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 48,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white py-3 px-4 border-y border-amber-800/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Deal Title */}
        <div className="flex items-center gap-2.5">
          <span className="p-1 rounded-md bg-rose-600 text-white animate-pulse">
            <Flame className="w-3.5 h-3.5" />
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider uppercase text-amber-300">
              Winter Loom Flash Sale
            </span>
            <span className="text-stone-300 hidden sm:inline">&bull;</span>
            <span className="text-stone-300 hidden sm:inline">
              Up to 25% Off Pure Kashmiri Pashmina &amp; Wool Wraps
            </span>
          </div>
        </div>

        {/* Countdown & Stock Claimed */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-stone-400 uppercase text-[10px] mr-1">Ends in:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-white font-bold">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span>:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-white font-bold">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span>:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-amber-300 font-bold">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          <Link
            href="/products"
            className="hidden lg:inline-flex items-center gap-1 font-bold text-amber-300 hover:text-white transition"
          >
            <span>Shop Flash Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
