import React from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  Eye,
  Settings,
  Truck,
  Boxes,
  Tag,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { getAdminDashboardStats, getSettings, formatPrice } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const stats = getAdminDashboardStats();
  const settings = getSettings();

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
            <span>{settings.site_name || 'Shawl Ghar'} — Executive Command Center</span>
          </h1>
          <p className="text-xs uppercase tracking-wider text-stone-500 mt-1">
            Production E-Commerce Suite • WhatsApp Hotline: <strong className="text-emerald-700 font-mono">{settings.whatsapp_number}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Orders ({stats.totalOrders})</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Stock Alerts ({stats.lowStockCount})</span>
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shawl</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-2xs"
          >
            <Eye className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {formatPrice(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-stone-400">Total verified customer orders</p>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">{stats.totalOrders}</div>
            <div className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {stats.pendingOrders} Pending
            </div>
          </div>
          <p className="text-[11px] text-stone-400">{stats.deliveredOrders} delivered across Pakistan</p>
        </div>

        {/* KPI 3: Registered Patrons */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Customer CRM</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {stats.totalCustomers}
          </div>
          <p className="text-[11px] text-stone-400">Registered connoisseur buyer profiles</p>
        </div>

        {/* KPI 4: Inventory Health */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Stock</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {stats.totalProducts} <span className="text-xs font-sans font-normal text-stone-400">items</span>
            </div>
            {stats.lowStockCount > 0 ? (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {stats.lowStockCount} Alert
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Healthy
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-400">Automated stock decrement on checkout</p>
        </div>
      </div>

      {/* Two Column Command Layout: Recent Orders & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-stone-900 text-base">
                  Recent Customer Orders
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Latest checkout transactions ready for parcel processing.
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs uppercase tracking-wider font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                <span>All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-900">
                          <Link href="/admin/orders" className="hover:underline">
                            {o.order_number}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {o.customer_name}
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {o.shipping_city}
                        </td>
                        <td className="py-3 px-4 font-serif font-bold text-stone-900">
                          {formatPrice(o.grand_total)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {o.order_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-stone-500">
                        No orders recorded yet. Placing a test order on the storefront will show it here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-stone-50 border-t border-stone-100 text-right">
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 inline-flex items-center gap-1"
            >
              <span>Manage all order dispatches &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Low Stock Watchlist */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-stone-900 text-base">
                  Low Stock Watchlist
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Items nearing exhaustion requiring artisan weaver re-orders.
                </p>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs uppercase tracking-wider font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                <span>Stock Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-stone-100">
              {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="p-4 flex items-center justify-between text-xs hover:bg-stone-50 transition">
                    <div>
                      <div className="font-serif font-bold text-stone-900">{p.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        SKU: SG-00{p.id} • {formatPrice(p.price)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-mono font-bold text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                        {p.stock_quantity} left
                      </span>
                      <div className="text-[10px] text-stone-400">Limit: {p.low_stock_threshold}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-serif text-sm font-bold text-stone-900">All Items Well-Stocked</p>
                  <p className="text-xs text-stone-400">No products are currently under their low stock thresholds.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-stone-50 border-t border-stone-100 text-right">
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 inline-flex items-center gap-1"
            >
              <span>Open Stock Adjustment Center &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
