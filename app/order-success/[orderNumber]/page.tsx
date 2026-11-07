'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice, buildWhatsAppLink } from '@/lib/format';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Building2,
  Clock
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Received', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'packed', label: 'Packed & Inspected', icon: Package },
  { key: 'shipped', label: 'Dispatched (Courier)', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: ShieldCheck },
];

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order);
            setHistory(data.history || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-stone-700 text-lg">Retrieving your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-stone-900">Order Not Found</h1>
        <p className="text-xs text-stone-500">We could not find an order with number &quot;{orderNumber}&quot;.</p>
        <Link href="/" className="inline-block px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase">
          Back to Homepage
        </Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.order_status);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  const whatsappMessage = `Hello Shawl Ghar! I placed order #${order.order_number} for ${order.customer_name} (Total: ${formatPrice(order.grand_total)}). Please confirm dispatch schedule. Thank you!`;
  const whatsappUrl = buildWhatsAppLink('0313-5209085', whatsappMessage);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 print:py-0 print:px-0">
      
      {/* Top Banner (hidden on print) */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm text-center space-y-4 print:hidden">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Shukriya! Order Confirmed</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Thank You, {order.customer_name}!
          </h1>
          <p className="text-xs text-stone-500 max-w-lg mx-auto">
            Your artisanal Kashmiri shawl order has been placed successfully and is being prepared with extreme care.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm font-bold text-stone-800">
          <span className="text-stone-400 font-sans font-normal text-xs">Order ID:</span>
          <span>{order.order_number}</span>
        </div>
      </div>

      {/* Visual Tracking Progress Timeline (hidden on print) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6 print:hidden">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-serif font-bold text-stone-900 text-base">Live Order Pipeline</h2>
          <span className="text-xs bg-amber-100 text-amber-900 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Status: {order.order_status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {ORDER_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border text-center space-y-2 transition ${
                  isCurrent
                    ? 'border-amber-800 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-800'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                    : 'border-stone-100 text-stone-400 bg-stone-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs ${
                    isCompleted ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">{step.label}</div>
              </div>
            );
          })}
        </div>

        {order.tracking_number && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-600">
              Courier: <strong>{order.courier_name || 'TCS / Leopards'}</strong>
            </span>
            <span className="font-mono font-bold text-stone-900">Tracking: {order.tracking_number}</span>
          </div>
        )}
      </div>

      {/* Official Printable Invoice Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-stone-200 pb-8">
          <div>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-wider">
              SHAWL GHAR
            </span>
            <p className="text-[11px] uppercase tracking-widest text-stone-500 mt-0.5">
              Handcrafted Kashmiri Shawls &amp; Artisanal Stoles
            </p>
            <p className="text-xs text-stone-400 mt-2">
              Madina Clothes Market, Rawalpindi, Pakistan • Phone: 0313-5209085
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="text-xs uppercase tracking-wider text-stone-400">Tax Invoice / Receipt</div>
            <div className="text-xl font-serif font-bold text-stone-900 font-mono">{order.order_number}</div>
            <div className="text-xs text-stone-500">
              Date: {new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-stone-600 border-b border-stone-200 pb-8">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest block">Recipient Information</span>
            <div className="font-bold text-stone-900 text-sm">{order.customer_name}</div>
            <div>Phone: {order.customer_phone}</div>
            <div>Email: {order.customer_email}</div>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest block">Destination Address</span>
            <div className="font-semibold text-stone-900">{order.shipping_street}</div>
            <div>{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}</div>
            <div className="pt-1">
              Payment: <strong className="uppercase text-amber-900">{order.payment_method.replace('_', ' ')}</strong>
            </div>
          </div>
        </div>

        {/* Bank Details Note if Bank Transfer chosen */}
        {order.payment_method === 'bank_transfer' && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-stone-800 space-y-1.5">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-800" />
              <span>Direct Bank Transfer Payment Instructions</span>
            </div>
            <p>Please transfer the total amount of <strong>{formatPrice(order.grand_total)}</strong> to our official account:</p>
            <div className="font-mono text-xs bg-white p-2.5 rounded-lg border border-amber-200">
              Bank: <strong>Meezan Bank Limited</strong> | Title: <strong>Shawl Ghar Textiles</strong> | IBAN: <strong>PK42MEZN0001234567890123</strong>
            </div>
            <p className="text-[11px] text-stone-500">After payment, send your transfer screenshot on WhatsApp to <strong>0313-5209085</strong> with order #{order.order_number}.</p>
          </div>
        )}

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4 text-center">SKU</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {order.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3.5 px-4 font-serif font-bold text-stone-900 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt="" className="w-10 h-12 object-cover rounded border shrink-0 print:hidden" />
                    <span>{item.product_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-stone-400">{item.product_sku || '—'}</td>
                  <td className="py-3.5 px-4 text-right font-mono">{formatPrice(item.unit_price)}</td>
                  <td className="py-3.5 px-4 text-center font-bold font-mono">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-stone-900">{formatPrice(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-stone-200 pt-6 text-xs">
          <div className="text-stone-400 space-y-1">
            <p>• All orders are inspected for 100% authentic needlework before dispatch.</p>
            <p>• Return or exchange within 7 days in case of manufacturing defect.</p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-right">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_total > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.coupon_code || 'Promo'}):</span>
                <span className="font-mono">-{formatPrice(order.discount_total)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Shipping ({order.shipping_method}):</span>
              <span className="font-mono">{order.shipping_total === 0 ? 'Free' : formatPrice(order.shipping_total)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
              <span>Grand Total:</span>
              <span className="font-mono text-lg text-amber-900">{formatPrice(order.grand_total)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer Buttons (hidden on print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 print:hidden">
        <Link
          href="/products"
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Confirmation</span>
          </a>
        </div>
      </div>

    </div>
  );
}
