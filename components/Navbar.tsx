'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Phone, User, Heart, Truck } from 'lucide-react';
import { cleanWhatsAppNumber } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import LiveSearchBar from '@/components/LiveSearchBar';

interface NavbarProps {
  siteName?: string;
  siteTagline?: string;
  whatsappNumber?: string;
}

export default function Navbar({
  siteName = 'Shawl Ghar',
  siteTagline = 'Handcrafted Kashmiri Shawls & Artisanal Stoles',
  whatsappNumber = '0313-5209085',
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cart, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();

  const cleanPhone = cleanWhatsAppNumber(whatsappNumber);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shawls', href: '/products' },
    { name: 'Collections', href: '/categories' },
    { name: 'Track Order', href: '/track-order' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo Brand */}
          <div className="flex items-center">
            <Link href="/" className="group flex flex-col items-start">
              <span className="text-2xl sm:text-3xl font-serif tracking-[0.15em] uppercase font-bold text-stone-900 group-hover:text-amber-800 transition flex items-center gap-2">
                <span>{siteName}</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-stone-500 font-medium">
                {siteTagline || 'Handcrafted Shawls & Fine Textiles'}
              </span>
            </Link>
          </div>

          {/* Desktop Live Autocomplete Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <LiveSearchBar />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs sm:text-sm tracking-wider uppercase font-medium transition-colors ${
                    isActive
                      ? 'text-stone-950 font-bold border-b-2 border-stone-900 pb-1'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (WhatsApp Callout, Wishlist, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs transition"
              title="Order on WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp:</span>
              <span>{whatsappNumber}</span>
            </a>

            {/* Wishlist Icon with Live Badge */}
            <Link
              href="/wishlist"
              className="relative p-2 text-stone-700 hover:text-rose-600 transition rounded-full hover:bg-stone-100"
              title="Saved Items / Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600/20' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Customer Account Icon */}
            <Link
              href="/account"
              className="p-2 text-stone-700 hover:text-stone-950 transition rounded-full hover:bg-stone-100"
              title="My Account & Orders"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Icon with Live Badge */}
            <div className="relative">
              <button
                type="button"
                className="p-2 text-stone-700 hover:text-stone-950 transition rounded-full hover:bg-stone-100 cursor-pointer"
                title="View Shopping Bag"
                onClick={openDrawer}
              >
                <ShoppingBag className="w-5 h-5" />
                {cart && cart.item_count > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-amber-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    {cart.item_count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Live Search Bar */}
        <div className="lg:hidden pb-3">
          <LiveSearchBar />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 text-sm uppercase tracking-wider flex items-center justify-between"
              >
                <span>{link.name}</span>
                {link.name === 'Track Order' && <Truck className="w-4 h-4 text-amber-800" />}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md font-medium text-rose-700 hover:bg-rose-50 text-sm uppercase tracking-wider flex items-center justify-between"
            >
              <span>Saved Shawls ({wishlistCount})</span>
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
            </Link>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold text-xs"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Order via WhatsApp: {whatsappNumber}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
