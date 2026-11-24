'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  Printer,
  ChevronRight
} from 'lucide-react';
import { Order, OrderItem, formatPrice, buildWhatsAppLink } from '@/lib/format';

const LIFECYCLE_STAGES = [
  { key: 'pending', label: 'Order Placed', desc: 'Received & Queued' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Verified with Patron' },
  { key: 'packed', label: 'Artisan Packed', desc: 'Silk Wrap & Velvet Box' },
  { key: 'shipped', label: 'Dispatched', desc: 'Handed to Courier' },
  { key: 'delivered', label: 'Delivered', desc: 'Handed over at Doorstep' },
];

const STAGE_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 1,
  packed: 2,
  shipped: 3,
  out_for_delivery: 3,
  delivered: 4,
};

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<{
    order: Order;
    items: OrderItem[];
    timeline: any[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError('');
    setLoading(true);
    setOrderData(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No matching order found');
        return;
      }
      setOrderData(data);
    } catch {
      setError('Network error while checking order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = orderData ? STAGE_ORDER[orderData.order.order_status] ?? 0 : 0;
  const isCancelled = orderData?.order.order_status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5" />
          <span>Live Courier Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Track Your Kashmiri Parcel
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Enter your Order Number or mobile phone to track your delivery status across Pakistan.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. SG-202611-1626 or 0300-1234567"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 px-7 bg-stone-900 hover:bg-amber-900 disabled:opacity-50 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer shrink-0"
            >
              {loading ? 'Searching...' : 'Track Parcel'}
            </button>
          </div>
          <p className="text-[11px] text-stone-400">
            Tip: You can find your order number in your order confirmation SMS, invoice, or WhatsApp message.
          </p>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {orderData && (
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm animate-in fade-in duration-300">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-lg font-bold text-amber-900">
                  {orderData.order.order_number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {orderData.order.order_status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Recipient: <strong className="text-stone-800">{orderData.order.customer_name}</strong> • Destination: <strong className="text-stone-800">{orderData.order.shipping_city}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-400 block">Total COD Payable</span>
              <span className="font-serif text-2xl font-bold text-stone-950">
                {formatPrice(orderData.order.grand_total)}
              </span>
            </div>
          </div>

          {/* Courier Partner Info */}
          {(orderData.order.courier_name || orderData.order.tracking_number) && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-stone-500 text-[11px] uppercase tracking-wider font-semibold">
                    Courier Partner
                  </div>
                  <div className="font-bold text-stone-900 text-sm">
                    {orderData.order.courier_name || 'TCS Express Pakistan'}
                  </div>
                </div>
              </div>

              {orderData.order.tracking_number && (
                <div className="font-mono text-xs bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-stone-800 self-start sm:self-auto">
                  Tracking #: <strong>{orderData.order.tracking_number}</strong>
                </div>
              )}
            </div>
          )}

          {/* Daraz-Style Visual Milestone Timeline */}
          {!isCancelled ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Dispatch Lifecycle Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {LIFECYCLE_STAGES.map((st, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={st.key}
                      className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                        isCurrent
                          ? 'border-amber-800 bg-amber-50/60 ring-2 ring-amber-800/20'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-stone-200 opacity-50 bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400">Step {idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                      <div className="font-serif font-bold text-xs text-stone-900">{st.label}</div>
                      <p className="text-[10px] text-stone-500 leading-tight">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
              This order was marked as <strong>Cancelled</strong>. Please reach out to our WhatsApp support if you have any questions.
            </div>
          )}

          {/* Ordered Shawls Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Parcel Contents ({orderData.items.length})
            </h3>
            <div className="border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
              {orderData.items.map((it) => (
                <div key={it.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900">{it.product_name}</h4>
                    <p className="text-[11px] text-stone-400">
                      Qty: {it.quantity} &bull; Unit Price: {formatPrice(it.unit_price)}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-stone-900">
                    {formatPrice(it.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help & Invoice Link */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href={buildWhatsAppLink(
                '0313-5209085',
                `Hello! I am inquiring about my Shawl Ghar Order #${orderData.order.order_number}. Please share latest parcel tracking update.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp (0313-5209085)</span>
            </a>

            <Link
              href={`/order-success/${orderData.order.order_number}`}
              target="_blank"
              className="text-xs font-semibold text-stone-700 hover:text-amber-900 inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>View &amp; Print Official Invoice &rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
