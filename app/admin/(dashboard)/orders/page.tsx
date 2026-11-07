'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  X,
  AlertCircle
} from 'lucide-react';
import { Order, OrderItem, formatPrice } from '@/lib/format';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-800' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800' },
  processing: { label: 'Processing', bg: 'bg-purple-100', text: 'text-purple-800' },
  packed: { label: 'Packed', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  shipped: { label: 'Shipped', bg: 'bg-cyan-100', text: 'text-cyan-800' },
  out_for_delivery: { label: 'Out for Delivery', bg: 'bg-teal-100', text: 'text-teal-800' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-100', text: 'text-rose-800' },
  refunded: { label: 'Refunded', bg: 'bg-stone-100', text: 'text-stone-800' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<(Order & { items?: OrderItem[] }) | null>(null);
  const [updating, setUpdating] = useState(false);

  // Tracking update state
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingSuccess, setTrackingSuccess] = useState('');

  const loadOrders = async (status = filterStatus) => {
    try {
      setLoading(true);
      const url = status && status !== 'all' ? `/api/admin/orders?status=${status}` : '/api/admin/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(filterStatus);
  }, [filterStatus]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          comment: `Status changed to ${newStatus} via Admin Console`,
        }),
      });
      if (res.ok) {
        await loadOrders(filterStatus);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus as any } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      setTrackingSuccess('');
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: carrierInput,
          trackingNumber: trackingInput,
        }),
      });
      if (res.ok) {
        setTrackingSuccess('Tracking updated!');
        setSelectedOrder((prev) =>
          prev
            ? { ...prev, courier_name: carrierInput, tracking_number: trackingInput }
            : null
        );
        await loadOrders(filterStatus);
        setTimeout(() => setTrackingSuccess(''), 2500);
      }
    } catch (err) {
      console.error('Failed to update tracking:', err);
    } finally {
      setUpdating(false);
    }
  };

  const openOrderModal = (order: Order & { items?: OrderItem[] }) => {
    setSelectedOrder(order);
    setCarrierInput(order.courier_name || 'TCS Express');
    setTrackingInput(order.tracking_number || '');
    setTrackingSuccess('');
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.customer_phone.toLowerCase().includes(q) ||
      o.shipping_city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage parcel dispatch, tracking status, and invoice generation across Pakistan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders(filterStatus)}
            className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order # (e.g. SG-2026), customer name, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-800"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-serif text-base font-bold text-stone-900">No orders found</p>
            <p className="text-xs text-stone-500">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Customer orders will appear here as soon as they checkout.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((o) => {
                  const st = STATUS_CONFIG[o.order_status] || {
                    label: o.order_status,
                    bg: 'bg-stone-100',
                    text: 'text-stone-700',
                  };
                  return (
                    <tr key={o.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-900">
                        {o.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{o.customer_name}</div>
                        <div className="text-[11px] text-stone-400">{o.customer_phone}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {o.shipping_city}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {o.items?.length || 1} items
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 font-serif">
                        {formatPrice(o.grand_total)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 uppercase">
                          {o.payment_method === 'cod' ? 'COD' : o.payment_method === 'bank_transfer' ? 'Bank' : o.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openOrderModal(o)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details & Management Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    Order {selectedOrder.order_number}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      STATUS_CONFIG[selectedOrder.order_status]?.bg || 'bg-stone-100'
                    } ${STATUS_CONFIG[selectedOrder.order_status]?.text || 'text-stone-700'}`}
                  >
                    {STATUS_CONFIG[selectedOrder.order_status]?.label || selectedOrder.order_status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-GB')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Advance */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Update Order Lifecycle Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['confirmed', 'processing', 'shipped', 'delivered'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updating || selectedOrder.order_status === st}
                    onClick={() => handleStatusChange(selectedOrder.id, st)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer text-center ${
                      selectedOrder.order_status === st
                        ? 'bg-amber-800 text-white shadow-xs font-bold'
                        : 'bg-white border border-stone-300 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    Mark {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking Assignment */}
            <form onSubmit={handleSaveTracking} className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-800" />
                <span>Courier &amp; Tracking Information</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Courier (e.g. TCS, Leopard, Trax)"
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800"
                />
                <input
                  type="text"
                  placeholder="Tracking Number"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>
              <div className="flex items-center justify-between">
                {trackingSuccess && (
                  <span className="text-xs text-emerald-700 font-semibold">{trackingSuccess}</span>
                )}
                <button
                  type="submit"
                  disabled={updating}
                  className="ml-auto py-1.5 px-4 bg-stone-900 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Save Tracking
                </button>
              </div>
            </form>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
                <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Customer Contact
                </div>
                <div className="font-semibold text-stone-800">{selectedOrder.customer_name}</div>
                <div className="text-stone-500">{selectedOrder.customer_email}</div>
                <div className="text-stone-500 font-mono">{selectedOrder.customer_phone}</div>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-1">
                <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Delivery Address
                </div>
                <div className="text-stone-700">{selectedOrder.shipping_street}</div>
                <div className="font-semibold text-stone-900">{selectedOrder.shipping_city}, {selectedOrder.shipping_province}</div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                Ordered Shawls &amp; Stoles
              </div>
              <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-stone-900">{it.product_name}</div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          SKU: SG-00{it.product_id} &times; Qty {it.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-stone-900 font-serif">
                        {formatPrice(it.total_price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-stone-500">Order item breakdown recorded.</div>
                )}
              </div>
            </div>

            {/* Summary & Printable Invoice Link */}
            <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs space-y-0.5">
                <div className="text-stone-500">Grand Total (incl. Shipping &amp; Discounts):</div>
                <div className="font-serif text-2xl font-bold text-stone-950">
                  {formatPrice(selectedOrder.grand_total)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/order-success/${selectedOrder.order_number}`}
                  target="_blank"
                  className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>View &amp; Print Invoice</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="py-2.5 px-4 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
