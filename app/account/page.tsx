'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import {
  User,
  Package,
  MapPin,
  Sparkles,
  LogOut,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Phone,
  CheckCircle2
} from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [recName, setRecName] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Rawalpindi');
  const [province, setProvince] = useState('Punjab');
  const [postal, setPostal] = useState('');

  const loadData = () => {
    Promise.all([
      fetch('/api/auth/customer-me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/customer/orders').then((r) => (r.ok ? r.json() : { orders: [] })),
    ])
      .then(([custData, orderData]) => {
        if (!custData || !custData.authenticated) {
          router.push('/account/login');
        } else {
          setCustomer(custData.customer);
          setAddresses(custData.customer.addresses || []);
          setOrders(orderData.orders || []);
        }
      })
      .catch(() => router.push('/account/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/customer-logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: recName,
          phone: recPhone,
          street_address: street,
          city,
          province,
          postal_code: postal,
          is_default: addresses.length === 0 ? 1 : 0,
        }),
      });
      if (res.ok) {
        setShowAddressModal(false);
        setRecName('');
        setRecPhone('');
        setStreet('');
        loadData();
      }
    } catch (e) {
      alert('Failed to save address');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-stone-700">Loading your profile...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Profile Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 font-serif font-bold text-2xl flex items-center justify-center border border-amber-200 shrink-0">
            {customer.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">{customer.name}</h1>
            <p className="text-xs text-stone-500">{customer.email} {customer.phone ? `• ${customer.phone}` : ''}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>{customer.loyalty_points || 0} Shawl Club Points</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Orders (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-700" />
              <span>Your Orders ({orders.length})</span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-serif font-bold text-stone-800 text-base">No orders placed yet</p>
              <p className="text-xs text-stone-400">Discover our authentic Kashmiri woolen shawls and place your first order.</p>
              <Link
                href="/products"
                className="inline-block px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800"
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="font-mono font-bold text-sm text-stone-900">{o.order_number}</div>
                      <div className="text-[11px] text-stone-400">
                        {new Date(o.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                        {o.order_status.replace('_', ' ')}
                      </span>
                      <Link
                        href={`/order-success/${o.order_number}`}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {o.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-800">{item.product_name}</span>
                          <span className="text-stone-400">× {item.quantity}</span>
                        </div>
                        <span className="font-mono font-semibold text-stone-900">{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-500 font-normal">Total Paid / COD:</span>
                    <span className="font-mono text-sm text-amber-900">{formatPrice(o.grand_total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Addresses & Quick Info (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>Saved Addresses</span>
              </h2>
              <button
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{a.recipient_name}</span>
                      {a.is_default === 1 && (
                        <span className="text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-stone-600">{a.street_address}</p>
                    <p className="text-stone-400">{a.city}, {a.province}</p>
                    <p className="text-stone-400 font-mono">{a.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>Shawl Ghar Promise</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Every shawl is handcrafted by master Kashmiri needleworkers. Have a custom order inquiry? Message our team directly on WhatsApp at <strong>0313-5209085</strong>.
            </p>
          </div>
        </div>

      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <h3 className="font-serif font-bold text-stone-900 text-lg">Add New Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Phone *</label>
                <input
                  type="tel"
                  required
                  value={recPhone}
                  onChange={(e) => setRecPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-stone-700">Province *</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
