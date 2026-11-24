'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  ShieldCheck,
  Truck,
  Sparkles,
  PhoneCall,
  Clock
} from 'lucide-react';
import { cleanWhatsAppNumber, buildWhatsAppLink } from '@/lib/format';

interface WhatsAppConciergeProps {
  whatsappNumber?: string;
  siteName?: string;
}

const QUICK_INQUIRIES = [
  {
    title: 'Confirm Cash on Delivery Order',
    icon: Truck,
    msg: 'Hello! I would like to place/confirm a Cash on Delivery order for a handcrafted shawl. Please share available dispatch slots.',
  },
  {
    title: 'Inquire about Pure Pashmina Weave',
    icon: Sparkles,
    msg: 'Hello! I would like to verify the fabric composition, softness, and needlework authenticity of your Pashmina collection.',
  },
  {
    title: 'Check Delivery Time to My City',
    icon: Clock,
    msg: 'Hello! How many days does courier delivery take to my city? (I need Cash on Delivery across Pakistan).',
  },
  {
    title: 'Custom Bridal / Gift Shawl Box',
    icon: ShieldCheck,
    msg: 'Hello! I am looking for a special bridal or gift heirloom shawl with luxury velvet gift packaging.',
  },
];

export default function WhatsAppConcierge({
  whatsappNumber = '0313-5209085',
  siteName = 'Shawl Ghar',
}: WhatsAppConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const cleanPhone = cleanWhatsAppNumber(whatsappNumber);

  const handleSendPrompt = (text: string) => {
    const url = buildWhatsAppLink(cleanPhone, text);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    const url = buildWhatsAppLink(
      cleanPhone,
      `Hello ${siteName}! ${customMsg.trim()}`
    );
    window.open(url, '_blank', 'noopener,noreferrer');
    setCustomMsg('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Luxury Concierge Card Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight">
                  {siteName} Concierge
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Direct Master Artisan Desk</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#FAF8F5]">
            <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-xs text-stone-700 leading-relaxed shadow-2xs">
              Assalam-o-Alaikum! Welcome to <strong>{siteName}</strong>. How may our Kashmiri artisans assist your wardrobe today?
            </div>

            {/* Quick Inquiries */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block px-1">
                Frequently Asked Topics:
              </span>
              {QUICK_INQUIRIES.map((q, idx) => {
                const Icon = q.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendPrompt(q.msg)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-xs font-semibold text-stone-800 transition flex items-center gap-2.5 cursor-pointer shadow-2xs group"
                  >
                    <Icon className="w-4 h-4 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="flex-1 truncate">{q.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSend} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={!customMsg.trim()}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Footer Hotline */}
          <div className="p-2.5 bg-stone-100 border-t border-stone-200 text-center text-[11px] text-stone-500 font-medium">
            Hotline: <strong className="text-stone-800 font-mono">{whatsappNumber}</strong> &bull; Rawalpindi, PK
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md text-stone-900 border border-emerald-300 shadow-xl px-4 py-2 rounded-full text-xs font-semibold hover:bg-emerald-50 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Chat on WhatsApp:</span>
            <span className="font-mono text-emerald-800 font-bold">{whatsappNumber}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open WhatsApp Concierge"
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative border-2 border-white cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
