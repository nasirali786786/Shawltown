'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Calendar,
  DollarSign,
  ShieldCheck,
  Users
} from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface CustomerRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: string | number;
  loyalty_points: number;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const totalSpendSum = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0);
  const totalOrdersSum = customers.reduce((acc, c) => acc + (c.total_orders || 0), 0);
  const avgOrderValue = totalOrdersSum > 0 ? Math.round(totalSpendSum / totalOrdersSum) : 0;

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = (c.name || '').toLowerCase();
    return (
      fullName.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Customer Relationship Management (CRM)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered customer accounts, purchasing history, lifetime value, and order frequencies.
          </p>
        </div>
        <button
          onClick={loadCustomers}
          className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition"
        >
          Refresh Directory
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Registered Patrons</span>
            <Users className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {customers.length}
          </div>
          <div className="text-[11px] text-stone-400">Total verified accounts</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold uppercase tracking-wider">
            <span>Total Patron Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-900">
            {formatPrice(totalSpendSum)}
          </div>
          <div className="text-[11px] text-emerald-600">Across {totalOrdersSum} completed orders</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Average Order Value (AOV)</span>
            <ShoppingBag className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {formatPrice(avgOrderValue)}
          </div>
          <div className="text-[11px] text-stone-400">Per transaction</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patron by name, email, or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-800"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading patron directory...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <UserCheck className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-serif text-base font-bold text-stone-900">No patrons found</p>
            <p className="text-xs text-stone-500">
              Registered customers and checkout profiles will be displayed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Patron Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.name ? c.name.charAt(0) : 'P'}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-stone-900">
                            {c.name || 'Patron'}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">ID: SG-CUST-00{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-stone-800">{c.email}</div>
                      {c.phone && (
                        <div className="text-[11px] text-stone-400 font-mono">{c.phone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-800">
                      {c.total_orders}
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-stone-900">
                      {formatPrice(c.total_spent)}
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {c.last_order_date
                        ? new Date(c.last_order_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'No orders yet'}
                    </td>
                    <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
