'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Category, formatPrice } from '@/lib/format';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Package,
  Pencil,
  Tag,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface ProductManagementTableProps {
  initialProducts: Product[];
  categories: Category[];
  currencySymbol?: string;
}

export default function ProductManagementTable({
  initialProducts,
  categories,
  currencySymbol = 'Rs.',
}: ProductManagementTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editComparePrice, setEditComparePrice] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editStockStatus, setEditStockStatus] = useState('in_stock');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // New product form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id?.toString() || '1');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1000&auto=format&fit=crop');
  const [material, setMaterial] = useState('Premium Pure Wool (Soft, lightweight and warm)');
  const [origin, setOrigin] = useState('100% Authentic Hand-Done Kashmiri Needle Embroidery');
  const [isFeatured, setIsFeatured] = useState(false);
  const [stockStatus, setStockStatus] = useState('in_stock');

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadError(null);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image file');
      }
      if (isEdit) {
        setEditImageUrl(data.url);
      } else {
        setImageUrl(data.url);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: parseFloat(price),
          compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
          category_id: parseInt(categoryId),
          image_url: imageUrl,
          material,
          origin,
          is_featured: isFeatured ? 1 : 0,
          stock_status: stockStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      setSuccessMsg(`"${name}" was created successfully and saved to SQLite!`);
      setIsAddModalOpen(false);

      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setPrice('');
      setComparePrice('');

      router.refresh();

      // Refresh local list
      const fetchUpdated = await fetch('/api/products');
      const updatedData = await fetchUpdated.json();
      if (updatedData.products) {
        setProducts(updatedData.products);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}" from the catalog?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg(`"${productName}" was removed from the database.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditPrice(p.price.toString());
    setEditComparePrice(p.compare_at_price ? p.compare_at_price.toString() : '');
    setEditCategoryId(p.category_id.toString());
    setEditStockStatus(p.stock_status || 'in_stock');
    setEditIsFeatured(p.is_featured === 1);
    setEditImageUrl(p.image_url);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(editPrice),
          compare_at_price: editComparePrice ? parseFloat(editComparePrice) : null,
          category_id: parseInt(editCategoryId),
          stock_status: editStockStatus,
          is_featured: editIsFeatured ? 1 : 0,
          image_url: editImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product pricing');
      }

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                price: parseFloat(editPrice),
                compare_at_price: editComparePrice ? parseFloat(editComparePrice) : null,
                category_id: parseInt(editCategoryId),
                category_name: categories.find((c) => c.id === parseInt(editCategoryId))?.name || item.category_name,
                stock_status: editStockStatus as 'in_stock' | 'low_stock' | 'out_of_stock',
                is_featured: editIsFeatured ? 1 : 0,
                image_url: editImageUrl,
              }
            : item
        )
      );

      setSuccessMsg(`Pricing & options updated for "${editingProduct.name}"!`);
      setEditingProduct(null);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message || 'Error updating product');
    } finally {
      setEditLoading(false);
    }
  };

  // Filter products locally
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.material && p.material.toLowerCase().includes(search.toLowerCase()));

    const matchesCat =
      selectedCategory === 'all' || p.category_id.toString() === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Product Management
          </h1>
          <p className="text-xs uppercase tracking-wider text-stone-500 mt-1">
            Visual Catalog Matrix • Prices in {currencySymbol} PKR
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Shawl</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by title, weave, or fiber..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:bg-white focus:outline-none focus:border-stone-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
            Collection:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price ({currencySymbol})</th>
                <th className="py-3.5 px-6">Stock Status</th>
                <th className="py-3.5 px-6">Featured</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-stone-900 text-sm">{p.name}</div>
                        <div className="text-[11px] text-stone-400">
                          {p.material || 'Pure Wool'}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded text-[11px] font-medium">
                        {p.category_name}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-stone-900">{formatPrice(p.price, currencySymbol)}</div>
                      {p.compare_at_price && (
                        <div className="text-[10px] text-stone-400 line-through">
                          {formatPrice(p.compare_at_price, currencySymbol)}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          p.stock_status === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.stock_status === 'in_stock' ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {p.is_featured === 1 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Standard</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/products/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 font-semibold p-1 hover:bg-stone-100 rounded"
                        title="View Live"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="text-stone-400 hover:text-amber-700 p-1 hover:bg-amber-50 rounded transition cursor-pointer"
                        title="Edit Price & Details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === p.id}
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="text-stone-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete Shawl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold">No shawls found matching filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Add New Artisanal Shawl
                </h3>
                <p className="text-xs text-stone-500">
                  Creates a new product record in the SQLite database foundation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Shawl Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Stunning Maroon Handcrafted Kashmiri Wool Stole"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. stunning-maroon-handcrafted-kashmiri-wool-stole"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Description &amp; Highlights *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Apne winter look ko mazeed royal aur elegant banayein is dilkash Handmade Kashmiri Wool Stole ke sath..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2800"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Original Price (PKR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="4500"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Product Image (File Upload or Image URL) *
                  </label>
                  {uploadingImage && (
                    <span className="text-[11px] text-amber-700 font-semibold animate-pulse">Uploading file...</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL or upload directly..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-amber-800"
                  />
                  <label className="px-3.5 py-2 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg cursor-pointer transition shrink-0 flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <div className="text-[11px] text-rose-700 font-medium">{uploadError}</div>
                )}

                {/* Live Preview */}
                {imageUrl && (
                  <div className="flex items-center gap-3 pt-1 border-t border-stone-200/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-14 h-16 object-cover rounded-lg border border-stone-300 shadow-2xs shrink-0"
                    />
                    <div className="text-[11px] text-stone-600 leading-tight">
                      <span className="font-semibold text-emerald-800 block">✓ Live Image Preview Active</span>
                      You don&apos;t need to use Unsplash! You can upload any photo directly from your PC or mobile phone.
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Fabric &amp; Composition
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Premium Pure Wool (Soft, lightweight and warm)"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Craftsmanship &amp; Provenance
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="100% Authentic Hand-Done Kashmiri Needle Embroidery"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-chk"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-700"
                  />
                  <label htmlFor="featured-chk" className="text-xs text-stone-700 font-medium">
                    Feature on Homepage Showcase
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Stock Availability
                  </label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="in_stock">In Stock (Available)</option>
                    <option value="low_stock">Low Stock (Limited Edition)</option>
                    <option value="out_of_stock">Handcrafting Next Batch</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Edit Pricing & Options Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                    Edit Pricing &amp; Details
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    {editingProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Selling Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-bold focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Discounted / Final Selling Price</p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Original Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3500"
                    value={editComparePrice}
                    onChange={(e) => setEditComparePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Cut/Strikethrough Price (e.g. Rs. 3,500)</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Collection / Category *
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Product Image (File Upload or Image URL)
                  </label>
                  {uploadingImage && (
                    <span className="text-[11px] text-amber-700 font-semibold animate-pulse">Uploading file...</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="Enter image URL or upload directly..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-amber-800"
                  />
                  <label className="px-3.5 py-2 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg cursor-pointer transition shrink-0 flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Edit Live Preview */}
                {editImageUrl && (
                  <div className="flex items-center gap-3 pt-1 border-t border-stone-200/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editImageUrl}
                      alt="Preview"
                      className="w-14 h-16 object-cover rounded-lg border border-stone-300 shadow-2xs shrink-0"
                    />
                    <div className="text-[11px] text-stone-600 leading-tight">
                      <span className="font-semibold text-emerald-800 block">✓ Product Image Preview</span>
                      Upload from PC or paste any web link.
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Stock Availability
                  </label>
                  <select
                    value={editStockStatus}
                    onChange={(e) => setEditStockStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  >
                    <option value="in_stock">In Stock (Ready to Dispatch)</option>
                    <option value="low_stock">Low Stock (Limited Pieces)</option>
                    <option value="out_of_stock">Handcrafting Next Batch</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit-featured-chk"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-700 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="edit-featured-chk" className="text-xs text-stone-800 font-medium cursor-pointer">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-50 rounded-lg text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Update Pricing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
