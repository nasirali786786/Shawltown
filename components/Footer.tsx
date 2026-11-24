import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, HeartHandshake, MessageCircle } from 'lucide-react';
import { getSettings } from '@/lib/db';
import { cleanWhatsAppNumber } from '@/lib/format';

export default function Footer() {
  const settings = getSettings();
  const whatsapp = settings.whatsapp_number || '0313-5209085';
  const cleanPhone = cleanWhatsAppNumber(whatsapp);

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Craftsmanship */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-serif tracking-[0.15em] uppercase font-bold text-white">
                {settings.site_name || 'Shawl Ghar'}
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-amber-400 font-semibold">
                Authentic Kashmiri Textiles &amp; Stoles
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {settings.site_tagline || 'Authentic Handcrafted Kashmiri Shawls, Pure Wool Stoles & Fine Textiles.'} Preserving centuries-old needlework, pure cashmere, and artisanal heritage with nationwide delivery.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
              <HeartHandshake className="w-4 h-4 text-amber-500" />
              <span>100% Authentic Handcrafted Shawls</span>
            </div>
          </div>

          {/* Quick Collections */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">
              Curated Collections
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li>
                <Link href="/products?category=kashmiri-stoles" className="hover:text-amber-400 transition-colors">
                  Kashmiri Stoles (Stawlers)
                </Link>
              </li>
              <li>
                <Link href="/products?category=pashmina-kingri" className="hover:text-amber-400 transition-colors">
                  Pashmina &amp; Kingri Shawls
                </Link>
              </li>
              <li>
                <Link href="/products?category=needlework-sozni" className="hover:text-amber-400 transition-colors">
                  Needlework &amp; Sozni Shawls
                </Link>
              </li>
              <li>
                <Link href="/products?category=aari-work" className="hover:text-amber-400 transition-colors">
                  Aari Work Shawls
                </Link>
              </li>
              <li>
                <Link href="/products?category=woolen-kashmiri" className="hover:text-amber-400 transition-colors">
                  Woolen Kashmiri Shawls
                </Link>
              </li>
              <li>
                <Link href="/products?category=jamawar-kani" className="hover:text-amber-400 transition-colors">
                  Jamawar &amp; Kani Shawls
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">
              Store Navigation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  Complete Catalog
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-amber-400 transition-colors">
                  Browse Collections
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-amber-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-amber-400 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  Direct WhatsApp Orders
                </a>
              </li>
            </ul>
          </div>

          {/* WhatsApp & Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">
              WhatsApp Orders &amp; Concierge
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-stone-400">
              <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Direct WhatsApp Hotline:
                </span>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white font-bold text-sm hover:text-emerald-400 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{whatsapp}</span>
                </a>
              </div>

              <div className="flex items-start gap-3 text-stone-400">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{settings.contact_address || 'Shop 14, Heritage Loom Plaza, MM Alam Road / Blue Area, Pakistan'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`mailto:${settings.contact_email || 'support@shawlghar.com'}`} className="hover:text-white transition">
                  {settings.contact_email || 'support@shawlghar.com'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Mon – Sat: 10:00 AM – 09:00 PM PKT</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} {settings.site_name || 'Shawl Ghar'}. All rights reserved. Handcrafted Heritage &amp; Modern Elegance.
          </div>
          <div className="flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700/60 text-stone-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All prices in Pakistani Rupees ({settings.currency_symbol || 'Rs.'} PKR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
