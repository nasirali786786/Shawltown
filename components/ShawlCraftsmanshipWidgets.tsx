'use client';

import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Feather,
  Award,
  ShieldCheck,
  Gift,
  Sparkles,
  X,
  Check,
  Printer,
  CircleDot,
} from 'lucide-react';
import { Product } from '@/lib/format';

export interface GiftPreferences {
  velvetBox: boolean;
  monogramEnabled: boolean;
  monogramInitials: string;
  giftMessage: string;
}

const GIFT_PREFS_STORAGE_KEY = 'shawlghar_gift_prefs';

export function getStoredGiftPrefs(): GiftPreferences {
  if (typeof window === 'undefined') {
    return { velvetBox: false, monogramEnabled: false, monogramInitials: '', giftMessage: '' };
  }
  try {
    const raw = localStorage.getItem(GIFT_PREFS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore storage errors
  }
  return { velvetBox: false, monogramEnabled: false, monogramInitials: '', giftMessage: '' };
}

export function saveStoredGiftPrefs(prefs: GiftPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GIFT_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

export function WarmthAndWeightMeter({ product }: { product: Product }) {
  const weight = product.weight_grams || 340;
  const text = `${product.name} ${product.material || ''} ${product.category_slug || ''}`.toLowerCase();

  const isPashmina = text.includes('pashmina') || text.includes('cashmere') || text.includes('ring') || text.includes('toosha');
  const isStole = text.includes('stole') || weight <= 220;
  const isHeavyWool = text.includes('heavy') || text.includes('twill') || weight >= 400;

  // Warmth scale 1-5
  let warmthScore = 4;
  let seasonLabel = 'Peak Winter (Lahore / Islamabad / Pindi)';
  let drapeLabel = 'Fluid & Graceful Drape';

  if (isHeavyWool) {
    warmthScore = 5;
    seasonLabel = 'Deep Mountain Chill (Murree / North / Sub-Zero)';
    drapeLabel = 'Structured Heavy Heritage Drape';
  } else if (isPashmina) {
    warmthScore = 5;
    seasonLabel = 'Featherlight High-Insulation Winter';
    drapeLabel = 'Cloud-Soft Gossamer Drape';
  } else if (isStole) {
    warmthScore = 3;
    seasonLabel = 'Autumn, Spring & Mild Winter Evenings';
    drapeLabel = 'Sleek Lightweight Urban Drape';
  }

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-800" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Warmth &amp; Weight Meter
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full border border-stone-200">
          ~{weight}g
        </span>
      </div>

      {/* 5-bar Warmth Gauge */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-stone-500 font-medium">Thermal Insulation Rating</span>
          <span className="font-bold text-amber-900">{warmthScore} / 5 Warmth</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-2 rounded-full transition-all ${
                level <= warmthScore
                  ? level >= 4
                    ? 'bg-gradient-to-r from-amber-700 to-rose-700'
                    : 'bg-amber-600'
                  : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-stone-600 font-medium pt-0.5">
          Ideal for: <strong className="text-stone-900">{seasonLabel}</strong>
        </p>
      </div>

      {/* Drape & Feel Tag */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
        <span className="flex items-center gap-1.5">
          <Feather className="w-3.5 h-3.5 text-amber-700" />
          <span>{drapeLabel}</span>
        </span>
        {isPashmina && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CircleDot className="w-3 h-3" />
            <span>Ring-Test Pass</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function AuthenticityCertificateCard({
  product,
  siteName = 'Shawl Ghar',
}: {
  product: Product;
  siteName?: string;
}) {
  const [open, setOpen] = useState(false);

  const text = `${product.name} ${product.material || ''}`.toLowerCase();
  const isPashmina = text.includes('pashmina') || text.includes('cashmere') || text.includes('ring') || text.includes('toosha');
  const fiberGrade = isPashmina ? '14 – 16 Microns (Grade-A Changthangi Fleece)' : '18 – 21 Microns (Superfine Himalayan Wool)';
  const certId = `SG-CERT-${String(product.id).padStart(4, '0')}-2026`;

  return (
    <>
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm border border-amber-700/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5">
              <span>Digital Authenticity Certificate</span>
            </div>
            <p className="text-[10px] text-stone-300 truncate">
              {isPashmina ? 'Verified Ring-Test Pashmina • Pure Artisan Seal' : 'Certified Kashmiri Handloom & Pure Natural Wool'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-bold uppercase tracking-wider shrink-0 transition cursor-pointer shadow-xs"
        >
          Verify
        </button>
      </div>

      {/* Luxury Certificate Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#FAF8F5] max-w-lg w-full rounded-3xl p-2 shadow-2xl border-2 border-amber-600/60 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-2 border-dashed border-amber-800/40 rounded-2xl p-6 sm:p-8 space-y-5 relative">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close certificate"
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-600 text-amber-900 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-amber-800 block">
                  {siteName} Heritage Craft Guild
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-950">
                  Certificate of Authenticity
                </h3>
                <p className="text-[11px] font-mono text-stone-500">Certificate ID: {certId}</p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500">Certified Piece:</span>
                  <span className="font-serif font-bold text-stone-900 text-right">{product.name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500">Fiber Fineness:</span>
                  <span className="font-semibold text-stone-900 text-right">{fiberGrade}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500">Loom Origin:</span>
                  <span className="font-semibold text-stone-900 text-right">{product.origin || 'Kashmir Heritage Looms'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500">Ring Test Verification:</span>
                  <span className="font-bold text-emerald-700 text-right">
                    {isPashmina ? 'PASSED (Glides Through Ring)' : 'Pure Handloom Wool Certified'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500">Quality Inspection:</span>
                  <span className="font-semibold text-stone-900 text-right">Hand-Inspected Prior to Dispatch</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-stone-500 border-t border-stone-200">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Authentic Guarantee</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 text-amber-900 font-bold hover:underline cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Seal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function LuxuryGiftAndMonogramBox({
  onPrefsChange,
}: {
  onPrefsChange?: (prefs: GiftPreferences) => void;
}) {
  const [prefs, setPrefs] = useState<GiftPreferences>({
    velvetBox: false,
    monogramEnabled: false,
    monogramInitials: '',
    giftMessage: '',
  });

  useEffect(() => {
    const stored = getStoredGiftPrefs();
    setPrefs(stored);
    onPrefsChange?.(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePrefs = (next: GiftPreferences) => {
    setPrefs(next);
    saveStoredGiftPrefs(next);
    onPrefsChange?.(next);
  };

  return (
    <div className="bg-rose-50/40 border border-rose-200/70 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-900">
        <Gift className="w-4 h-4 text-rose-700" />
        <span>Luxury Gifting &amp; Personalization</span>
      </div>

      {/* Royal Velvet Keepsake Box */}
      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-stone-200 hover:border-rose-300 transition cursor-pointer">
        <input
          type="checkbox"
          checked={prefs.velvetBox}
          onChange={(e) => updatePrefs({ ...prefs, velvetBox: e.target.checked })}
          className="mt-0.5 rounded border-stone-300 text-rose-700 focus:ring-rose-700 cursor-pointer"
        />
        <div className="flex-1 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-stone-900">Royal Maroon Velvet Keepsake Box</span>
            <span className="font-mono font-bold text-rose-800">+Rs. 850</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Gold-embossed velvet box with satin ribbon &amp; calligraphy gift card — perfect for brides &amp; mothers.
          </p>
        </div>
      </label>

      {/* Hand-Embroidered Monogram Initials */}
      <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-2.5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.monogramEnabled}
            onChange={(e) =>
              updatePrefs({
                ...prefs,
                monogramEnabled: e.target.checked,
                monogramInitials: e.target.checked ? prefs.monogramInitials : '',
              })
            }
            className="mt-0.5 rounded border-stone-300 text-amber-800 focus:ring-amber-800 cursor-pointer"
          />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-stone-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Hand-Embroidered Corner Initials (Monogram)</span>
              </span>
              <span className="font-mono font-bold text-amber-900">+Rs. 500</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Our artisan hand-stitches up to 3 initials on the hem corner in matching silk thread.
            </p>
          </div>
        </label>

        {prefs.monogramEnabled && (
          <div className="pl-6 flex items-center gap-2">
            <input
              type="text"
              maxLength={4}
              placeholder="e.g. A.K"
              value={prefs.monogramInitials}
              onChange={(e) =>
                updatePrefs({ ...prefs, monogramInitials: e.target.value.toUpperCase() })
              }
              className="w-28 px-2.5 py-1.5 text-xs font-serif font-bold uppercase tracking-widest bg-stone-50 border border-amber-300 rounded-lg focus:outline-none focus:border-amber-800"
            />
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Auto-applied at Checkout</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
