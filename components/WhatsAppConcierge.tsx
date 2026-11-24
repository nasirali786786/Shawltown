'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  RotateCcw,
  Tag,
  PhoneCall,
  ExternalLink,
  RotateCw,
  User,
  ChevronRight,
} from 'lucide-react';
import { cleanWhatsAppNumber, buildWhatsAppLink } from '@/lib/format';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  actionLink?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
}

interface WhatsAppConciergeProps {
  whatsappNumber?: string;
  siteName?: string;
}

const QUICK_TOPICS = [
  { label: '🧣 Pashmina vs Wool', query: 'What is the difference between Pashmina and pure Wool?' },
  { label: '🚚 Delivery & COD', query: 'What are the delivery charges, time and COD availability?' },
  { label: '🎟️ Discount Vouchers', query: 'Are there any discount coupon codes available?' },
  { label: '📦 Track My Order', query: 'How can I track my order status?' },
  { label: '🔄 7-Day Return Policy', query: 'What is your return and exchange policy?' },
  { label: '👑 Bridal & Gift Box', query: 'Do you offer bridal shawls with luxury gift packaging?' },
];

export default function WhatsAppConcierge({
  whatsappNumber = '0313-5209085',
  siteName = 'Shawl Ghar',
}: WhatsAppConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'whatsapp'>('ai');
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cleanPhone = cleanWhatsAppNumber(whatsappNumber);

  const initialWelcomeMsg: ChatMessage = {
    id: 'welcome-1',
    sender: 'ai',
    text: `Assalam-o-Alaikum! Welcome to ${siteName}. I am your AI Artisan Concierge. I can answer questions about pure Kashmiri weaves, delivery across Pakistan, discount vouchers, or help you track an order in real-time. How may I assist you today?`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMsg]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Zero-cost, runtime local AI NLP intent matcher
  const generateAIResponse = (userText: string): { reply: string; action?: { label: string; href: string; isExternal?: boolean } } => {
    const q = userText.toLowerCase().trim();

    // 1. Salutations / Greetings
    if (q.match(/\b(hi|hello|hey|salam|aoa|assalam|kaise|kese|good morning|good evening)\b/)) {
      return {
        reply: `Wa Alaikum Assalam! Wonderful to have you at ${siteName}. Are you looking for a specific type of handcrafted shawl, need delivery time estimates, or looking for an active discount voucher?`,
      };
    }

    // 2. Fabric / Material / Pashmina / Wool / Quality
    if (q.match(/\b(pashmina|cashmere|wool|fabric|material|quality|kapra|asli|pure|original|embroidery|karhai|sozni)\b/)) {
      return {
        reply: `✨ **${siteName} Artisan Fabric Standards:**\n\n• **100% Pure Himalayan Wool & Cashmere:** Sourced from fine high-altitude fleece, ultra-soft with natural warmth.\n• **Hand-Done Needlework:** Authentic Sozni & Aari needle embroidery taking weeks to complete.\n• **Guaranteed Authenticity:** Backed by our heritage artisan certificate. You can inspect the fabric upon delivery before paying!`,
        action: { label: 'Explore Handloom Collection', href: '/products' },
      };
    }

    // 3. Delivery Times / Cities / Shipping / COD
    if (q.match(/\b(delivery|shipping|time|din|days|city|cities|lahore|karachi|islamabad|rawalpindi|peshawar|multan|quetta|faisalabad|charge|free)\b/)) {
      return {
        reply: `🚚 **Nationwide Delivery Across Pakistan:**\n\n• **Islamabad / Rawalpindi:** 1–2 Days (Express Hub)\n• **Lahore, Karachi, Peshawar, Multan, Faisalabad:** 2–3 Days\n• **Other Cities & Northern Areas:** 3–4 Days via TCS & Trax\n\n🎁 **Shipping Fee:** Rs. 199–249, or **100% FREE Delivery** on all orders above Rs. 5,000!\n\n💵 **Cash on Delivery (COD)** is available across all cities.`,
      };
    }

    // 4. Cash on Delivery (COD) / Payment Modes
    if (q.match(/\b(cod|cash on delivery|pay|payment|advance|jazzcash|easypaisa|bank)\b/)) {
      return {
        reply: `💵 **Cash on Delivery (COD) is 100% Supported!**\n\nYou pay cash directly to the courier agent when the parcel is delivered to your doorstep. We also accept direct Bank Transfer, JazzCash, and EasyPaisa if you prefer advance digital payment.`,
      };
    }

    // 5. Coupons / Discounts / Vouchers / Offers
    if (q.match(/\b(discount|coupon|voucher|code|offer|sale|promo|kam|sasta|deal)\b/)) {
      return {
        reply: `🎟️ **Active ${siteName} Promo Vouchers:**\n\n• **WELCOME10** — Flat 10% OFF on your first purchase.\n• **WINTER500** — Rs. 500 OFF on orders above Rs. 4,999.\n• **ROYALSHAWL** — 15% OFF on luxury heirloom pashmina stoles.\n\nUse any of these at Checkout to get your instant saving!`,
        action: { label: 'Go to Checkout', href: '/checkout' },
      };
    }

    // 6. Order Tracking / Dispatch Status
    if (q.match(/\b(track|tracking|order|status|where|mera order|dispatch|parcel|courier)\b/)) {
      return {
        reply: `📦 **Live Order Tracking:**\n\nYou can track the exact dispatch status and courier transit of your order right now using your Order Number (e.g. SG-ORD-1001) or your Mobile Phone Number!`,
        action: { label: 'Track Order Now', href: '/track-order' },
      };
    }

    // 7. Return & Exchange Policy
    if (q.match(/\b(return|exchange|wapis|badal|refund|policy|guarantee|warranty)\b/)) {
      return {
        reply: `🔄 **7-Day Hassle-Free Return & Exchange:**\n\nIf the color, drape, or fabric does not completely satisfy you, we offer an easy 7-day exchange or refund guarantee. Keep the item unworn with original tags!`,
      };
    }

    // 8. Bridal Shawls / Gift Box / Packaging
    if (q.match(/\b(bridal|wedding|gift|box|velvet|shaadi|dulhan|packaging|custom)\b/)) {
      return {
        reply: `👑 **Royal Bridal Heirlooms & Gift Packaging:**\n\nWe provide bespoke Kashmiri bridal shawls presented in gold-embossed velvet keepsake gift boxes. Perfect for weddings, Barat/Walima events, or prestigious gifts.`,
        action: {
          label: 'Inquire on WhatsApp',
          href: buildWhatsAppLink(cleanPhone, 'Hello! I am inquiring about your Bridal Shawl Collection and luxury gift packaging.'),
          isExternal: true,
        },
      };
    }

    // 9. Speak to Human / WhatsApp / Call
    if (q.match(/\b(human|call|phone|whatsapp|agent|contact|number|baat|help)\b/)) {
      return {
        reply: `📞 **Direct Artisan Hotline:**\n\nYou can chat or call directly with our master artisan on WhatsApp at **${whatsappNumber}**. We are available 7 days a week to share custom videos of shawls or take orders directly.`,
        action: {
          label: `Chat on WhatsApp (${whatsappNumber})`,
          href: buildWhatsAppLink(cleanPhone, 'Hello Shawl Ghar! I would like to speak directly with an artisan representative.'),
          isExternal: true,
        },
      };
    }

    // 10. Fallback with helpful recommendations
    return {
      reply: `I understand! As your ${siteName} AI Concierge, I can instantly help you with:\n\n• **Pashmina vs Pure Wool Weaves**\n• **Delivery time to your city & COD**\n• **Active discount voucher codes**\n• **Real-time Order Tracking**\n\nWould you like to speak directly with our master artisan on WhatsApp?`,
      action: {
        label: `Chat with Master Artisan (${whatsappNumber})`,
        href: buildWhatsAppLink(cleanPhone, `Hello! Question from website: ${userText}`),
        isExternal: true,
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    // Realistic typing delay (350ms to 500ms) for natural feel
    setTimeout(() => {
      const { reply, action } = generateAIResponse(text);
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: action,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 420);
  };

  const handleResetChat = () => {
    setMessages([initialWelcomeMsg]);
  };

  const handleWhatsAppRedirect = (presetMsg: string) => {
    const url = buildWhatsAppLink(cleanPhone, presetMsg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Interactive AI Chat & WhatsApp Card */}
      {isOpen && (
        <div className="mb-3 w-84 sm:w-96 bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col h-[520px] max-h-[85vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-3.5 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
                <Bot className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm leading-tight">
                    {siteName} AI Concierge
                  </h3>
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono uppercase">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Instant Free Assistance</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ai'
                  ? 'border-b-2 border-amber-800 text-amber-900 bg-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AI Chat Assistant</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 bg-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct WhatsApp</span>
            </button>
          </div>

          {/* Tab 1: AI Assistant Mode */}
          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#FAF8F5]">
              {/* Quick Prompt Chips */}
              <div className="p-2 border-b border-stone-200/80 bg-white/70 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
                {QUICK_TOPICS.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(topic.query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-[11px] font-medium text-stone-700 transition cursor-pointer shrink-0"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                        m.sender === 'user'
                          ? 'bg-stone-900 text-white rounded-br-xs'
                          : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.text}</div>

                      {/* Action Button if attached */}
                      {m.actionLink && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex">
                          {m.actionLink.isExternal ? (
                            <a
                              href={m.actionLink.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-2xs transition"
                            >
                              <span>{m.actionLink.label}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <Link
                              href={m.actionLink.href}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[11px] font-bold shadow-2xs transition"
                            >
                              <span>{m.actionLink.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-stone-400 mt-0.5 px-1 font-mono">
                      {m.time}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 bg-white border border-stone-200 p-2.5 rounded-2xl w-24 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-stone-400 font-sans ml-1">Thinking</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ask about shawls, delivery, discounts..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isTyping}
                  aria-label="Send message"
                  className="p-2.5 bg-stone-900 hover:bg-amber-900 disabled:opacity-40 text-white rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Direct WhatsApp Mode */}
          {activeTab === 'whatsapp' && (
            <div className="flex-1 p-4 space-y-3 bg-[#FAF8F5] overflow-y-auto">
              <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-xs text-stone-700 leading-relaxed shadow-2xs">
                Connect directly with our master loom artisan in Rawalpindi/Islamabad for custom orders, video previews, or phone assistance.
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block px-1">
                  1-Click WhatsApp Inquiries:
                </span>
                {[
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
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleWhatsAppRedirect(item.msg)}
                      className="w-full text-left p-2.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-xs font-semibold text-stone-800 transition flex items-center gap-2.5 cursor-pointer shadow-2xs group"
                    >
                      <Icon className="w-4 h-4 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="flex-1 truncate">{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-emerald-700 shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Direct WhatsApp Call/Chat Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleWhatsAppRedirect(`Hello ${siteName}! I would like to talk directly with an artisan representative.`)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Chat ({whatsappNumber})</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Hotline */}
          <div className="p-2 bg-stone-100 border-t border-stone-200 text-center text-[10px] text-stone-500 font-medium shrink-0 flex items-center justify-between px-3">
            <span>⚡ 100% Free Instant AI</span>
            <span>Hotline: <strong className="text-stone-800 font-mono">{whatsappNumber}</strong></span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md text-stone-900 border border-amber-300/80 shadow-xl px-4 py-2 rounded-full text-xs font-semibold hover:bg-amber-50/50 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Bot className="w-3.5 h-3.5 text-amber-800" />
            <span>Ask AI Assistant or WhatsApp</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Shawl Ghar AI Concierge"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-stone-900 to-amber-950 hover:from-amber-950 hover:to-stone-900 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative border-2 border-amber-200/50 cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-amber-300" />
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
