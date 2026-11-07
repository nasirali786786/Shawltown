'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Review, formatPrice, buildWhatsAppLink } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import {
  Sparkles,
  ShieldCheck,
  Feather,
  ShoppingBag,
  Share2,
  Check,
  MessageCircle,
  Flame,
  Star,
  Plus,
  Minus,
  Zap,
  Clock,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  whatsappNumber?: string;
  currencySymbol?: string;
  siteName?: string;
}

export default function ProductDetailView({
  product,
  relatedProducts,
  whatsappNumber = '0313-5209085',
  currencySymbol = 'Rs.',
  siteName = 'Shawl Ghar',
}: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  let additional: string[] = [];
  try {
    if (product.additional_images) {
      additional = JSON.parse(product.additional_images);
    }
  } catch {
    additional = [];
  }

  const allImages = [product.image_url, ...additional].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(allImages[0]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const maxStock = product.stock_quantity && product.stock_quantity > 0 ? product.stock_quantity : 15;
  const isOutOfStock = product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity <= 0);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const formattedPrice = formatPrice(product.price, currencySymbol);
  const formattedComparePrice = product.compare_at_price
    ? formatPrice(product.compare_at_price, currencySymbol)
    : null;

  // WhatsApp order concierge link in clean English
  const orderMessage = `Hello! I would like to order this handcrafted item from *${siteName}*:\n\n✨ *${product.name}* ✨\n*Price:* ${formattedPrice} ${formattedComparePrice ? `(Original: ${formattedComparePrice})` : ''}\n*Product Link:* ${typeof window !== 'undefined' ? window.location.href : `http://localhost:3000/products/${product.id}`}\n\nPlease confirm availability and share Cash on Delivery order details. Thank you!`;
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, orderMessage);

  useEffect(() => {
    async function loadReviews() {
      try {
        setReviewLoading(true);
        const res = await fetch(`/api/products/${product.id}/reviews`);
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setReviewLoading(false);
      }
    }
    loadReviews();
  }, [product.id]);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      setBuyingNow(true);
      await addToCart(product.id, quantity);
      router.push('/checkout');
    } catch (err) {
      console.error(err);
      setBuyingNow(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!reviewerName.trim()) {
      setReviewError('Please enter your full name');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please share your thoughts in the review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newRating,
          name: reviewerName,
          email: reviewerEmail,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review');
        return;
      }
      setReviewSuccess('Thank you! Your verified review has been published.');
      if (data.reviews) {
        setReviews(data.reviews);
      }
      setReviewComment('');
      setReviewTitle('');
      setShowReviewForm(false);
    } catch {
      setReviewError('Network error while posting your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider">
        <Link href="/" className="hover:text-stone-900 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-900 transition">
          Shawl Collection
        </Link>
        <span>/</span>
        {product.category_slug && (
          <>
            <Link
              href={`/products?category=${product.category_slug}`}
              className="hover:text-stone-900 transition"
            >
              {product.category_name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Image Gallery Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/5 w-full bg-stone-100 rounded-3xl overflow-hidden border border-stone-200/90 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.is_featured === 1 && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 bg-stone-900/90 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-xs shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured Loom Edition
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails (if multiple images) */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img
                      ? 'border-amber-800 ring-2 ring-amber-800/30'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details, Cart Actions & WhatsApp Ordering */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-xs">
              <Link
                href={`/products?category=${product.category_slug}`}
                className="uppercase tracking-widest font-semibold text-amber-900 hover:underline"
              >
                {product.category_name}
              </Link>
              <span className="text-stone-400 font-mono">SKU: SG-00{product.id}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars Quick Summary */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-stone-900">{averageRating}</span>
              <span className="text-stone-400">|</span>
              <a href="#customer-reviews" className="text-stone-600 hover:text-amber-900 underline font-medium">
                {reviews.length} {reviews.length === 1 ? 'Customer Review' : 'Customer Reviews'}
              </a>
            </div>

            {/* Special Limited Offer Banner & Pricing */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>🎁 Special Loom Artisan Offer</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-stone-950 font-serif">
                  {formattedPrice}
                </span>
                {formattedComparePrice && (
                  <span className="text-lg text-stone-400 line-through">
                    {formattedComparePrice}
                  </span>
                )}
                {discount && discount > 0 && (
                  <span className="bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-2xs">
                    Save {discount}%
                  </span>
                )}
              </div>

              <div className="text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className={`font-semibold ${isOutOfStock ? 'text-rose-800' : 'text-emerald-800'}`}>
                    {isOutOfStock
                      ? 'Out of Stock'
                      : product.stock_status === 'low_stock'
                      ? `Limited Stock — Only ${product.stock_quantity ?? 3} left!`
                      : `In Stock (${product.stock_quantity ?? 12} units ready for immediate dispatch)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Details */}
            <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-stone-200/80">
              {product.description}
            </div>

            {/* Quantity Selector & Shopping Cart Primary Actions */}
            <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Select Quantity</span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-stone-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock || isOutOfStock}
                    className="p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Bag & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || isOutOfStock}
                  className={`py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    added
                      ? 'bg-emerald-700 text-white'
                      : isOutOfStock
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-amber-900 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{adding ? 'Adding...' : 'Add to Bag'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buyingNow || isOutOfStock}
                  className="py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{buyingNow ? 'Processing...' : 'Instant Checkout'}</span>
                </button>
              </div>

              {/* Alternative Concierge Order: WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp ({whatsappNumber})</span>
              </a>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link copied to clipboard!' : 'Share this masterpiece'}</span>
                </button>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 space-y-2.5 text-xs text-stone-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-500">Fabric &amp; Composition:</span>
                <span className="font-bold text-stone-900">{product.material || 'Premium Pure Himalayan Wool'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-500">Craftsmanship:</span>
                <span className="font-bold text-stone-900">{product.origin || '100% Authentic Hand-Done Kashmiri Needle Embroidery'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-500">Payment Modes:</span>
                <span className="font-bold text-emerald-800">Cash on Delivery, Bank Transfer, JazzCash / Easypaisa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-500">Recommended Care:</span>
                <span className="font-bold text-stone-900">Dry Clean Only or Cold Hand Soak</span>
              </div>
            </div>

            {/* Shipping & Delivery Guarantee Highlights */}
            <div className="pt-2 grid grid-cols-3 gap-3 text-[11px] text-stone-600 text-center">
              <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1">
                <Truck className="w-4 h-4 mx-auto text-amber-800" />
                <p className="font-semibold text-stone-900">2-4 Days</p>
                <p className="text-[10px] text-stone-500">Nationwide Delivery</p>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1">
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-700" />
                <p className="font-semibold text-stone-900">100% Original</p>
                <p className="text-[10px] text-stone-500">Artisan Authenticity</p>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1">
                <RotateCcw className="w-4 h-4 mx-auto text-stone-700" />
                <p className="font-semibold text-stone-900">7-Day Return</p>
                <p className="text-[10px] text-stone-500">Hassle-Free Exchange</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="customer-reviews" className="pt-12 border-t border-stone-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Verified Customer Reviews
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Feedback from patron connoisseurs of authentic Kashmiri craft.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="self-start sm:self-auto py-2.5 px-4 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Review Submission Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-200"
          >
            <h3 className="font-serif text-lg font-bold text-stone-900">Share Your Experience</h3>

            {reviewError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {reviewError}
              </div>
            )}

            {/* Rating Stars Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-stone-700 ml-2">
                  {newRating === 5 ? '5 Stars — Exceptional' : `${newRating} Stars`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Tariq"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. fatima@example.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Review Headline</label>
              <input
                type="text"
                placeholder="e.g. Breathtaking embroidery and ultra-warm wool"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Review Details *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe the fabric quality, warmth, weave texture, packaging, or customer service..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-800 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="py-3 px-6 bg-stone-900 hover:bg-amber-900 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              {submittingReview ? 'Submitting Review...' : 'Publish Review'}
            </button>
          </form>
        )}

        {reviewSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reviewSuccess}</span>
          </div>
        )}

        {/* Reviews List */}
        {reviewLoading ? (
          <div className="py-8 text-center text-xs text-stone-500">Loading verified customer reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-8 text-center space-y-2">
            <Star className="w-8 h-8 text-amber-400 mx-auto fill-amber-400" />
            <p className="font-serif text-base font-bold text-stone-900">Be the first to review this shawl</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Share your thoughts on its weave, drape, and needlework with our connoisseur community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-3 shadow-2xs hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  {rev.is_verified_purchase === 1 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Buyer
                    </span>
                  )}
                </div>

                {rev.title && (
                  <h4 className="font-semibold text-stone-900 text-xs">{rev.title}</h4>
                )}

                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-medium text-stone-700">{rev.customer_name}</span>
                  {rev.created_at && (
                    <span>{new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-stone-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Complementary Shawls &amp; Stoles
            </h2>
            <Link
              href="/products"
              className="text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-stone-900"
            >
              View Full Catalog &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="aspect-4/5 w-full bg-stone-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                    {item.category_name}
                  </span>
                  <h3 className="font-serif font-medium text-stone-900 text-sm line-clamp-1">
                    <Link href={`/products/${item.id}`} className="hover:text-amber-800 transition">
                      {item.name}
                    </Link>
                  </h3>
                  <div className="text-sm font-bold text-stone-900">
                    {formatPrice(item.price, currencySymbol)}
                  </div>
                  <Link
                    href={`/products/${item.id}`}
                    className="w-full py-2 bg-stone-900 hover:bg-amber-900 text-white rounded-lg text-xs font-bold text-center block mt-2 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
