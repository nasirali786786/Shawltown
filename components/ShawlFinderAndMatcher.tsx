'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Compass,
  Palette,
  Upload,
  Check,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  MessageCircle,
  Heart,
  Crown,
  Flame,
} from 'lucide-react';
import { Product, formatPrice, buildWhatsAppLink } from '@/lib/format';
import { useCart } from '@/context/CartContext';

interface ShawlFinderAndMatcherProps {
  products: Product[];
  whatsappNumber?: string;
  currencySymbol?: string;
}

interface OutfitColorOption {
  id: string;
  name: string;
  urduLabel: string;
  hex: string;
  ringClass: string;
  recommendedKeywords: string[];
  stylingTip: string;
}

const OUTFIT_COLORS: OutfitColorOption[] = [
  {
    id: 'ivory',
    name: 'Ivory / Cream / Off-White',
    urduLabel: 'آف وائٹ / کریم سوٹ',
    hex: '#F5EFE6',
    ringClass: 'ring-stone-300',
    recommendedKeywords: ['maroon', 'black', 'jamawar', 'kani', 'aari'],
    stylingTip: 'Deep Maroon, Jet Black, or Rich Kani Jamawar creates a breathtaking royal contrast against ivory and cream attire.',
  },
  {
    id: 'maroon',
    name: 'Bridal Maroon / Crimson',
    urduLabel: 'میرون / برائیڈل ریڈ',
    hex: '#7A1C24',
    ringClass: 'ring-rose-800',
    recommendedKeywords: ['off-white', 'ivory', 'toosha', 'jamawar', 'sozni', 'pashmina'],
    stylingTip: 'Unbleached Ivory Pashmina, antique gold Jamawar, or delicate Sozni needlework elevates bridal maroon with Mughal elegance.',
  },
  {
    id: 'black',
    name: 'Jet Black / Charcoal',
    urduLabel: 'کالا / چارکول',
    hex: '#1C1917',
    ringClass: 'ring-stone-900',
    recommendedKeywords: ['kani', 'aari', 'maroon', 'toosha', 'off-white', 'kingri'],
    stylingTip: 'Multi-coloured Kani weaves, vibrant floral Aari borders, or classic warm Toosha wool pop brilliantly on jet black.',
  },
  {
    id: 'emerald',
    name: 'Emerald / Bottle Green / Navy',
    urduLabel: 'سبز / نیوی بلیو',
    hex: '#0F4C3A',
    ringClass: 'ring-emerald-800',
    recommendedKeywords: ['ivory', 'off-white', 'sozni', 'jamawar', 'pashmina', 'kingri'],
    stylingTip: 'Ivory Ring Pashmina, subtle Sozni Jaal, or Gold-accented Jamawar balances deep jewel-tone outfits effortlessly.',
  },
  {
    id: 'gold',
    name: 'Champagne / Beige / Pastel',
    urduLabel: 'گولڈن / بیج / پیسٹل',
    hex: '#D6B98C',
    ringClass: 'ring-amber-600',
    recommendedKeywords: ['maroon', 'black', 'jamawar', 'woolen', 'aari'],
    stylingTip: 'Rich Burgundy Jamawar, Midnight Black embroidered stoles, or bold Aari borders anchor soft pastel and champagne tones.',
  },
  {
    id: 'gents',
    name: 'Gents Shalwar Kameez / Sherwani',
    urduLabel: 'مردانہ شیروانی / شلوار قمیض',
    hex: '#44403C',
    ringClass: 'ring-stone-700',
    recommendedKeywords: ['toosha', 'woolen', 'kingri', 'micro-check', 'pashmina', 'jamawar'],
    stylingTip: 'Generous Twill-Weave Woolen shawls, Charcoal Kingri, or authentic Toosha wraps deliver timeless masculine grace.',
  },
];

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function classifyRgbToOutfitId(r: number, g: number, b: number): string {
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness > 210) return 'ivory';
  if (brightness < 55) return 'black';
  if (r > g + 35 && r > b + 35) return 'maroon';
  if (g > r + 15 || b > r + 20) return 'emerald';
  if (brightness > 145) return 'gold';
  return 'gents';
}

export default function ShawlFinderAndMatcher({
  products,
  whatsappNumber = '0313-5209085',
  currencySymbol = 'Rs.',
}: ShawlFinderAndMatcherProps) {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'quiz' | 'matcher'>('quiz');

  // Quiz State
  const [quizStep, setQuizStep] = useState<1 | 2 | 3 | 4>(1);
  const [recipient, setRecipient] = useState<'women' | 'men' | 'gift'>('women');
  const [occasion, setOccasion] = useState<'daily' | 'formal' | 'wedding'>('formal');
  const [budget, setBudget] = useState<'budget' | 'mid' | 'luxury'>('mid');

  // Outfit Matcher State
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitColorOption>(OUTFIT_COLORS[0]);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [detectedHex, setDetectedHex] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickAdd = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1800);
    } catch (err) {
      console.error(err);
    }
  };

  // Compute Quiz Recommendations from real products
  const getQuizResults = (): Product[] => {
    if (!products || products.length === 0) return [];
    const scored = products.map((p) => {
      let score = 0;
      const text = `${p.name} ${p.description} ${p.category_name || ''} ${p.material || ''}`.toLowerCase();

      // Budget scoring
      if (budget === 'budget' && p.price <= 4500) score += 4;
      if (budget === 'mid' && p.price > 4000 && p.price <= 9500) score += 4;
      if (budget === 'luxury' && p.price >= 8500) score += 4;

      // Occasion scoring
      if (occasion === 'daily' && (text.includes('stole') || text.includes('woolen') || text.includes('twill') || text.includes('micro-check'))) score += 3;
      if (occasion === 'formal' && (text.includes('aari') || text.includes('kingri') || text.includes('pashmina') || text.includes('toosha'))) score += 3;
      if (occasion === 'wedding' && (text.includes('jamawar') || text.includes('kani') || text.includes('sozni') || text.includes('royal') || text.includes('imperial'))) score += 4;

      // Recipient scoring
      if (recipient === 'men' && (text.includes('gents') || text.includes('toosha') || text.includes('woolen') || text.includes('charcoal') || text.includes('micro-check') || text.includes('kingri'))) score += 3;
      if (recipient === 'gift' && (p.is_featured === 1 || text.includes('royal') || text.includes('pashmina') || text.includes('sozni'))) score += 2;
      if (recipient === 'women' && (text.includes('stole') || text.includes('aari') || text.includes('sozni') || text.includes('jamawar') || text.includes('pashmina'))) score += 2;

      if (p.is_featured === 1) score += 1;
      return { product: p, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.product);
  };

  // Compute Outfit Matcher Recommendations
  const getOutfitMatches = (): Product[] => {
    if (!products || products.length === 0) return [];
    const keywords = selectedOutfit.recommendedKeywords;
    const scored = products.map((p) => {
      const text = `${p.name} ${p.description} ${p.category_name || ''} ${p.material || ''}`.toLowerCase();
      let score = 0;
      keywords.forEach((kw, idx) => {
        if (text.includes(kw)) {
          score += keywords.length - idx + 2;
        }
      });
      if (p.is_featured === 1) score += 1;
      return { product: p, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.product);
  };

  // Client-side Canvas Photo Color Extractor (100% Free, Zero Server Load)
  const handleOutfitPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      setUploadedPreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = 40;
          canvas.height = 40;
          ctx.drawImage(img, 0, 0, 40, 40);
          // Sample central 50% of image where fabric usually sits
          const data = ctx.getImageData(10, 10, 20, 20).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
          if (count > 0) {
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
            setDetectedHex(hex);
            const matchedId = classifyRgbToOutfitId(r, g, b);
            const found = OUTFIT_COLORS.find((c) => c.id === matchedId);
            if (found) setSelectedOutfit(found);
          }
        } catch (err) {
          console.error('Color detection error:', err);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const quizResults = getQuizResults();
  const outfitMatches = getOutfitMatches();

  const renderMatchCard = (p: Product, badgeText: string) => (
    <div
      key={p.id}
      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
    >
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image_url}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-2.5 left-2.5 bg-stone-900/90 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs">
          {badgeText}
        </span>
      </div>
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-800">
            {p.category_name || 'Kashmiri Weave'}
          </span>
          <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1 mt-0.5">
            <Link href={`/products/${p.id}`} className="hover:text-amber-800 transition">
              {p.name}
            </Link>
          </h4>
          <p className="text-xs font-bold text-stone-950 font-serif mt-1">
            {formatPrice(p.price, currencySymbol)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => handleQuickAdd(p.id)}
            className={`py-2 px-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer ${
              addedId === p.id
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-900 hover:bg-amber-900 text-white'
            }`}
          >
            {addedId === p.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            <span>{addedId === p.id ? 'Added' : 'Add'}</span>
          </button>
          <Link
            href={`/products/${p.id}`}
            className="py-2 px-2.5 rounded-xl border border-stone-300 text-stone-800 hover:bg-stone-100 text-[11px] font-bold uppercase tracking-wider text-center transition"
          >
            Inspect
          </Link>
        </div>
      </div>
    </div>
  );

  const whatsappOutfitUrl = buildWhatsAppLink(
    whatsappNumber,
    `Hello Shawl Ghar! I want to match a Kashmiri shawl with my "${selectedOutfit.name}" outfit${detectedHex ? ` (Color Tone: ${detectedHex})` : ''}. Please suggest your finest matching pieces!`
  );

  return (
    <section id="shawl-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-amber-900/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header & Mode Tabs */}
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Styling Studio • Free Tool</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">
              Find Your Perfect Shawl or Match Your Outfit
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-light">
              Unsure which Kashmiri weave suits your winter wardrobe or wedding dress? Use our 60-second Artisan Finder or match directly with your outfit colour.
            </p>
          </div>

          {/* Mode Toggle Pills */}
          <div className="inline-flex p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>60s Shawl Finder</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matcher')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'matcher'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Match My Outfit</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 60-SECOND SHAWL FINDER QUIZ */}
        {activeTab === 'quiz' && (
          <div className="relative pt-8 space-y-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-between max-w-md text-[11px] font-semibold text-stone-400">
              {[
                { step: 1, label: '1. Who For' },
                { step: 2, label: '2. Occasion' },
                { step: 3, label: '3. Budget' },
                { step: 4, label: 'Matches' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setQuizStep(s.step as any)}
                  className={`transition cursor-pointer ${
                    quizStep === s.step
                      ? 'text-amber-400 font-bold underline underline-offset-4'
                      : quizStep > s.step
                      ? 'text-emerald-400'
                      : 'text-stone-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {quizStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  Step 1: Who is this handcrafted shawl for?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'women', title: 'Ladies Elegance', sub: 'Stoles, Sozni, Aari & Pashmina', icon: Crown },
                    { id: 'men', title: 'Gents Classic', sub: 'Toosha, Kingri & Heavy Twill Wool', icon: Flame },
                    { id: 'gift', title: 'Special Gift / Mother', sub: 'Heirloom pieces ready for velvet box', icon: Heart },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setRecipient(opt.id as any);
                          setQuizStep(2);
                        }}
                        className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
                          recipient === opt.id
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-stone-200'
                        }`}
                      >
                        <Icon className="w-6 h-6 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                        <div className="font-serif font-bold text-base">{opt.title}</div>
                        <div className="text-xs text-stone-400 mt-1">{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  Step 2: What is the primary occasion?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'daily', title: 'Everyday & Office Winter', sub: 'Lightweight warmth & breathable comfort' },
                    { id: 'formal', title: 'Dinners & Formal Gatherings', sub: 'Fine embroidery, Kingri & Aari borders' },
                    { id: 'wedding', title: 'Bridal, Barat & Luxury Events', sub: 'Heirloom Jamawar, Kani & Jaaldar Sozni' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setOccasion(opt.id as any);
                        setQuizStep(3);
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                        occasion === opt.id
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-stone-200'
                      }`}
                    >
                      <div className="font-serif font-bold text-base">{opt.title}</div>
                      <div className="text-xs text-stone-400 mt-1">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  Step 3: Choose your preferred budget range (PKR)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'budget', title: 'Under Rs. 4,500', sub: 'Refined Kashmiri Stoles & Everyday Wraps' },
                    { id: 'mid', title: 'Rs. 4,500 – Rs. 9,500', sub: 'Pure Wool, Kingri, Aari & Ring Pashmina' },
                    { id: 'luxury', title: 'Rs. 9,500+ Heirloom', sub: 'Collector Jamawar, Kani & Jaaldar Sozni' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setBudget(opt.id as any);
                        setQuizStep(4);
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                        budget === opt.id
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-stone-200'
                      }`}
                    >
                      <div className="font-serif font-bold text-base">{opt.title}</div>
                      <div className="text-xs text-stone-400 mt-1">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      ✨ Artisan Curated Matches Ready
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                      Top 3 Shawls Recommended For You
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuizStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition self-start sm:self-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-stone-900">
                  {quizResults.map((p, idx) =>
                    renderMatchCard(p, idx === 0 ? '🏆 Best Match' : '✨ Great Fit')
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MATCH MY OUTFIT (COLOR SWATCH + FREE CLIENT-SIDE PHOTO MATCHER) */}
        {activeTab === 'matcher' && (
          <div className="relative pt-8 space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Swatches & Optional Photo Upload */}
              <div className="lg:col-span-5 space-y-5 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                    1. Select Your Dress / Suit Colour
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {OUTFIT_COLORS.map((c) => {
                      const active = selectedOutfit.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedOutfit(c);
                            setUploadedPreview(null);
                            setDetectedHex(null);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                            active
                              ? 'bg-amber-500/20 border-amber-400 text-white'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-stone-300'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full shrink-0 border border-white/40 shadow-inner`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold truncate">{c.name}</div>
                            <div className="text-[10px] text-stone-400 truncate">{c.urduLabel}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Photo Color Detector */}
                <div className="pt-3 border-t border-white/10 space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                    Or Upload Your Suit / Lehnga Photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOutfitPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-amber-400/50 hover:border-amber-400 bg-white/5 hover:bg-white/10 text-xs font-semibold text-amber-200 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadedPreview ? 'Change Outfit Photo' : 'Upload Dress Photo for Instant Tone Match'}</span>
                  </button>

                  {uploadedPreview && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadedPreview}
                        alt="Uploaded Outfit Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-white/20 shrink-0"
                      />
                      <div className="text-[11px] space-y-0.5">
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span>Detected Fabric Tone:</span>
                          {detectedHex && (
                            <span
                              className="inline-block w-3.5 h-3.5 rounded-full border border-white"
                              style={{ backgroundColor: detectedHex }}
                            />
                          )}
                        </div>
                        <div className="text-stone-300">Matched to: <strong>{selectedOutfit.name}</strong></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stylist Note + WhatsApp */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-100 leading-relaxed space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Master Stylist Advice:</span>
                  </div>
                  <p className="text-[11px] text-stone-200">{selectedOutfit.stylingTip}</p>
                  <a
                    href={whatsappOutfitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition pt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send outfit photo to our Artisan on WhatsApp &rarr;</span>
                  </a>
                </div>
              </div>

              {/* Right: Matched Shawl Results */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                    Best Complementary Shawls for <span className="text-amber-400">{selectedOutfit.name}</span>
                  </h3>
                  <Link
                    href="/products"
                    className="text-xs text-amber-300 hover:text-white flex items-center gap-1 shrink-0"
                  >
                    <span>All Shawls</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-stone-900">
                  {outfitMatches.map((p, idx) =>
                    renderMatchCard(p, idx === 0 ? '🎨 Top Contrast' : '✨ Stylist Pick')
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
