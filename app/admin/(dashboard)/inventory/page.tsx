'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Plus,
  Minus,
  RotateCcw,
  Search,
  History,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Product, InventoryLog, formatPrice } from '@/lib/format';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [qtyChange, setQtyChange] = useState<number>(5);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'logs'>('inventory');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct) return;
    setAdjustError('');

    try {
      setAdjusting(true);
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustModalProduct.id,
          qtyChange,
          notes: adjustNotes || `Stock adjustment for ${adjustModalProduct.name}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdjustError(data.error || 'Failed to adjust stock');
        return;
      }
      setAdjustModalProduct(null);
      setAdjustNotes('');
      await loadData();
    } catch {
      setAdjustError('Network error while updating stock.');
    } finally {
      setAdjusting(false);
    }
  };

  const lowStockItems = products.filter(
    (p) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5) && (p.stock_quantity ?? 0) > 0
  );
  const outOfStockItems = products.filter((p) => (p.stock_quantity ?? 0) === 0);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Artisan Stock &amp; Inventory Center
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time warehouse tracking, low-stock alerts, and immutable inventory movement audit logs.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition"
        >
          Refresh Stock
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Total Catalog Products</span>
            <Boxes className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {products.length}
          </div>
          <div className="text-[11px] text-stone-400">Master loom collection</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold uppercase tracking-wider">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-amber-900">
            {lowStockItems.length}
          </div>
          <div className="text-[11px] text-amber-600">Threshold &le; 5 units</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-700 font-semibold uppercase tracking-wider">
            <span>Out of Stock</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-rose-900">
            {outOfStockItems.length}
          </div>
          <div className="text-[11px] text-rose-600">Urgent weaver restock required</div>
        </div>
      </div>

      {/* Tab Controls & Search */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Stock Management
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Movement Logs ({logs.length})</span>
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-800"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Product Stock Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading stock status...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                    <th className="py-3 px-4 text-center">Threshold</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => {
                    const isLow = (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5) && (p.stock_quantity ?? 0) > 0;
                    const isOut = (p.stock_quantity ?? 0) === 0;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stone-200"
                            />
                            <div>
                              <div className="font-serif font-bold">{p.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono">SKU: SG-00{p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {p.category_name || 'Shawl'}
                        </td>
                        <td className="py-3 px-4 font-serif font-bold text-stone-900">
                          {formatPrice(p.price)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {p.stock_quantity ?? 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-stone-400 font-mono">
                          {p.low_stock_threshold ?? 5}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustModalProduct(p);
                              setQtyChange(5);
                              setAdjustNotes('');
                              setAdjustError('');
                            }}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Adjust Stock</span>
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
      )}

      {/* Tab 2: Audit Logs Table */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Change Type</th>
                  <th className="py-3 px-4 text-center">Movement</th>
                  <th className="py-3 px-4 text-center">Balance After</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                      {new Date(l.created_at).toLocaleString('en-GB')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {l.product_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {l.change_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 font-bold font-mono ${
                          l.quantity_change > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {l.quantity_change > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {l.quantity_change > 0 ? `+${l.quantity_change}` : l.quantity_change}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-800">
                      {l.balance_after}
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {l.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Adjust Artisan Inventory
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {adjustModalProduct.name} (Current Stock: {adjustModalProduct.stock_quantity ?? 0})
              </p>
            </div>

            {adjustError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Stock Change (use + to restock, - to write off)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQtyChange((prev) => prev - 1)}
                    className="p-2 border border-stone-300 rounded-xl hover:bg-stone-100 transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4 text-stone-600" />
                  </button>
                  <input
                    type="number"
                    value={qtyChange}
                    onChange={(e) => setQtyChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center py-2 text-sm font-bold bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                  />
                  <button
                    type="button"
                    onClick={() => setQtyChange((prev) => prev + 1)}
                    className="p-2 border border-stone-300 rounded-xl hover:bg-stone-100 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-stone-600" />
                  </button>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 text-center">
                  Resulting balance will be: <strong>{Math.max(0, (adjustModalProduct.stock_quantity ?? 0) + qtyChange)}</strong> units
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Adjustment Reason / Audit Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received new shipment from Srinagar weavers loom"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="py-2.5 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || qtyChange === 0}
                  className="py-2.5 px-5 bg-stone-900 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {adjusting ? 'Saving...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
