'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Percent,
  Banknote,
  Calendar,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';
import { Coupon, formatPrice } from '@/lib/format';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // New coupon form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSubtotal, setMinSubtotal] = useState<number>(0);
  const [maxDiscountCap, setMaxDiscountCap] = useState<number | ''>('');
  const [usageLimitTotal, setUsageLimitTotal] = useState<number>(100);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!code.trim()) {
      setFormError('Coupon code is required');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description,
          discount_type: discountType,
          discount_value: discountValue,
          min_subtotal: minSubtotal || 0,
          max_discount_cap: maxDiscountCap === '' ? undefined : maxDiscountCap,
          usage_limit_total: usageLimitTotal || 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create coupon');
        return;
      }

      setIsModalOpen(false);
      setCode('');
      setDescription('');
      setDiscountValue(10);
      setMinSubtotal(0);
      setMaxDiscountCap('');
      await loadCoupons();
    } catch {
      setFormError('Network error while saving coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: currentStatus ? 0 : 1,
        }),
      });
      await loadCoupons();
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotional coupon code?')) return;
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' }),
      });
      await loadCoupons();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Promotional Coupons &amp; Discounts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure percentage discounts, seasonal promo vouchers, and minimum cart spend rules.
          </p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setFormError('');
          }}
          className="py-2.5 px-4 bg-stone-900 hover:bg-amber-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Tag className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-serif text-base font-bold text-stone-900">No active promotional coupons</p>
            <p className="text-xs text-stone-500">
              Create a seasonal voucher like <strong className="font-mono">KASHMIR10</strong> to incentivize orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min. Spend</th>
                  <th className="py-3 px-4">Usage Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-sm text-stone-900 tracking-wider">
                        {c.code}
                      </div>
                      {c.description && (
                        <div className="text-[11px] text-stone-400">{c.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {c.discount_type === 'percentage' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          <Percent className="w-3 h-3" />
                          {c.discount_value}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-bold">
                          <Banknote className="w-3 h-3" />
                          {formatPrice(c.discount_value)} OFF
                        </span>
                      )}
                      {c.max_discount_cap && (
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Cap: {formatPrice(c.max_discount_cap)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-700 font-serif">
                      {c.min_subtotal > 0 ? formatPrice(c.min_subtotal) : 'None'}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">
                      {c.times_used} / {c.usage_limit_total || '&infin;'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c.id, c.is_active)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                          c.is_active === 1
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {c.is_active === 1 ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-stone-400" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Create Promotional Voucher
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Set customer discount percentages or fixed rupee deductions.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHARED15 or KASHMIR500"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold tracking-wider bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Promo Headline / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% Off Handcrafted Pashmina Stoles"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Rupees (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Min. Subtotal (Rs.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Max Cap (Rs.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional cap"
                    value={maxDiscountCap}
                    onChange={(e) => setMaxDiscountCap(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Total Redemption Usage Limit
                </label>
                <input
                  type="number"
                  min={1}
                  value={usageLimitTotal}
                  onChange={(e) => setUsageLimitTotal(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="py-2.5 px-5 bg-stone-900 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {creating ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
