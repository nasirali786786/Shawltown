'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { getStoredGiftPrefs, saveStoredGiftPrefs } from '@/components/ShawlCraftsmanshipWidgets';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  Lock,
  Tag,
  Gift,
  Sparkles,
} from 'lucide-react';

const PAKISTANI_CITIES = [
  'Rawalpindi',
  'Islamabad',
  'Lahore',
  'Karachi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Muzaffarabad',
  'Mirpur',
  'Gilgit',
  'Other City',
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, refreshCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingApartment, setShippingApartment] = useState('');
  const [shippingCity, setShippingCity] = useState('Rawalpindi');
  const [shippingProvince, setShippingProvince] = useState('Punjab');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card'>('cod');
  const [notes, setNotes] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState(searchParams.get('coupon') || '');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  // Luxury Gifting & Monogram state (auto-synced from Product page if selected)
  const [velvetGiftBox, setVelvetGiftBox] = useState(false);
  const [monogramEnabled, setMonogramEnabled] = useState(false);
  const [monogramInitials, setMonogramInitials] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => {
    const prefs = getStoredGiftPrefs();
    setVelvetGiftBox(prefs.velvetBox);
    setMonogramEnabled(prefs.monogramEnabled);
    setMonogramInitials(prefs.monogramInitials);
    setGiftMessage(prefs.giftMessage || '');
  }, []);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  // Validate coupon if present
  useEffect(() => {
    if (couponCode && subtotal > 0) {
      fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setCouponDiscount(data.discount);
            setCouponStatus(`Coupon "${couponCode.toUpperCase()}" applied: -Rs. ${data.discount}`);
          }
        })
        .catch(() => {});
    }
  }, [couponCode, subtotal]);

  // Pre-fill logged-in customer info if available
  useEffect(() => {
    fetch('/api/auth/customer-me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.customer) {
          setCustomerName(data.customer.name || '');
          setCustomerEmail(data.customer.email || '');
          setCustomerPhone(data.customer.phone || '');
          if (data.customer.addresses && data.customer.addresses.length > 0) {
            const def = data.customer.addresses.find((a: any) => a.is_default) || data.customer.addresses[0];
            setShippingStreet(def.street_address || '');
            setShippingApartment(def.apartment || '');
            setShippingCity(def.city || 'Rawalpindi');
            setShippingProvince(def.province || 'Punjab');
            setShippingPostalCode(def.postal_code || '');
          }
        }
      })
      .catch(() => {});
  }, []);

  // Calculate Shipping based on city and subtotal
  const cleanCity = shippingCity.trim().toLowerCase();
  let shippingRate = 350;
  let shippingMethodName = 'Nationwide Courier (TCS / Leopards)';

  if (cleanCity === 'rawalpindi' || cleanCity === 'islamabad') {
    shippingRate = subtotal >= 3000 ? 0 : 150;
    shippingMethodName = 'Twin Cities Fast Delivery';
  } else if (['lahore', 'faisalabad', 'multan', 'sialkot', 'gujranwala', 'bahawalpur'].includes(cleanCity)) {
    shippingRate = subtotal >= 5000 ? 0 : 250;
    shippingMethodName = 'Punjab Express Courier';
  } else {
    shippingRate = subtotal >= 5000 ? 0 : 350;
    shippingMethodName = 'Nationwide TCS / Leopards Courier';
  }

  const prepaidDiscount =
    paymentMethod !== 'cod' ? Math.round(Math.max(0, subtotal - couponDiscount) * 0.05) : 0;
  const giftBoxFee = velvetGiftBox ? 850 : 0;
  const monogramFee = monogramEnabled && monogramInitials.trim() ? 500 : 0;
  const giftAddOnTotal = giftBoxFee + monogramFee;

  const grandTotal = Math.max(
    0,
    subtotal - couponDiscount - prepaidDiscount + shippingRate + giftAddOnTotal
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_street: shippingStreet,
          shipping_apartment: shippingApartment,
          shipping_city: shippingCity,
          shipping_province: shippingProvince,
          shipping_postal_code: shippingPostalCode,
          shipping_method: shippingMethodName,
          payment_method: paymentMethod,
          coupon_code: couponDiscount > 0 ? couponCode : undefined,
          gift_box: velvetGiftBox,
          monogram_initials: monogramEnabled ? monogramInitials.trim() : undefined,
          gift_message: velvetGiftBox ? giftMessage.trim() : undefined,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      saveStoredGiftPrefs({
        velvetBox: false,
        monogramEnabled: false,
        monogramInitials: '',
        giftMessage: '',
      });
      await refreshCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-stone-900">Your bag is empty</h1>
          <p className="text-stone-500 text-xs">Please add at least one shawl to your bag before proceeding to checkout.</p>
        </div>
        <Link
          href="/products"
          className="inline-block px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition"
        >
          View Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/cart" className="hover:text-stone-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Bag</span>
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Secure Checkout</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-amber-700" />
            <span>Secure Checkout</span>
          </h1>
          <p className="text-xs uppercase tracking-wider text-stone-500 mt-1">
            Complete your order with Cash on Delivery or Bank Transfer
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Form Columns (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Customer Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h2 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-mono">1</span>
                <span>Customer &amp; Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Khan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Used by courier rider for delivery coordination</p>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h2 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>Shipping Address in Pakistan</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Street Address / House No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 14, Street 8, Sector F-7/2"
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Apartment / Floor / Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Shell Pump"
                    value={shippingApartment}
                    onChange={(e) => setShippingApartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Destination City *</label>
                  <select
                    value={shippingCity}
                    onChange={(e) => {
                      setShippingCity(e.target.value);
                      if (['rawalpindi', 'lahore', 'faisalabad', 'multan', 'sialkot', 'gujranwala', 'bahawalpur'].includes(e.target.value.toLowerCase())) {
                        setShippingProvince('Punjab');
                      } else if (e.target.value.toLowerCase() === 'islamabad') {
                        setShippingProvince('Islamabad Capital Territory');
                      } else if (['karachi', 'hyderabad', 'sukkur'].includes(e.target.value.toLowerCase())) {
                        setShippingProvince('Sindh');
                      } else if (['peshawar', 'abbottabad'].includes(e.target.value.toLowerCase())) {
                        setShippingProvince('Khyber Pakhtunkhwa');
                      } else if (e.target.value.toLowerCase() === 'quetta') {
                        setShippingProvince('Balochistan');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-semibold focus:bg-white focus:outline-none focus:border-stone-800"
                  >
                    {PAKISTANI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Province *</label>
                  <input
                    type="text"
                    required
                    value={shippingProvince}
                    onChange={(e) => setShippingProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Postal Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 44000"
                    value={shippingPostalCode}
                    onChange={(e) => setShippingPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Order Notes / Delivery Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please deliver between 2 PM - 6 PM, or gift packaging requested."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* 3. Luxury Gifting & Personalization (Optional) */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200/80 shadow-2xs space-y-4">
              <h2 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-800 text-white text-xs flex items-center justify-center font-mono">3</span>
                <Gift className="w-4 h-4 text-rose-700" />
                <span>Luxury Gift Packaging &amp; Custom Monogram (Optional)</span>
              </h2>

              <div className="space-y-3 text-xs">
                <label className={`block p-4 rounded-xl border transition cursor-pointer ${velvetGiftBox ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-600' : 'border-stone-200 bg-stone-50 hover:bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={velvetGiftBox}
                      onChange={(e) => setVelvetGiftBox(e.target.checked)}
                      className="mt-0.5 rounded border-stone-300 text-rose-700 focus:ring-rose-700 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-900">Royal Maroon Velvet Keepsake Gift Box</span>
                        <span className="font-mono font-bold text-rose-800">+Rs. 850</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Rigid gold-foiled velvet gift box with satin ribbon &amp; bespoke greeting card. Ideal for bridal gifts &amp; mothers.
                      </p>
                      {velvetGiftBox && (
                        <div className="mt-3">
                          <input
                            type="text"
                            maxLength={120}
                            placeholder="Write your personalized gift card note (optional)..."
                            value={giftMessage}
                            onChange={(e) => setGiftMessage(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rose-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                <div className={`p-4 rounded-xl border transition ${monogramEnabled ? 'border-amber-700 bg-amber-50/40 ring-1 ring-amber-700' : 'border-stone-200 bg-stone-50 hover:bg-white'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monogramEnabled}
                      onChange={(e) => {
                        setMonogramEnabled(e.target.checked);
                        if (!e.target.checked) setMonogramInitials('');
                      }}
                      className="mt-0.5 rounded border-stone-300 text-amber-800 focus:ring-amber-800 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          <span>Hand-Embroidered Corner Initials (Monogram)</span>
                        </span>
                        <span className="font-mono font-bold text-amber-900">+Rs. 500</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Custom hand-embroidered initials (up to 3 letters) stitched discreetly on the shawl corner.
                      </p>
                    </div>
                  </label>
                  {monogramEnabled && (
                    <div className="mt-3 pl-7 flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. A.K"
                        value={monogramInitials}
                        onChange={(e) => setMonogramInitials(e.target.value.toUpperCase())}
                        className="w-32 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-serif font-bold uppercase tracking-widest text-stone-900 focus:outline-none focus:border-amber-800"
                      />
                      <span className="text-[11px] text-stone-500">Enter initials for embroidery</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Payment Method Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-mono">4</span>
                  <span>Payment Method</span>
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  <Sparkles className="w-3 h-3" />
                  <span>Save Extra 5% on Prepaid Orders</span>
                </span>
              </div>

              <div className="space-y-3">
                
                {/* Method: COD */}
                <label className={`block p-4 rounded-xl border transition cursor-pointer ${paymentMethod === 'cod' ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800' : 'border-stone-200 bg-stone-50 hover:bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-amber-800 focus:ring-amber-800"
                      />
                      <div>
                        <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-700" />
                          <span>Cash on Delivery (COD)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Pay in cash to the rider when your parcel arrives at your doorstep.</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Method: Direct Bank Transfer */}
                <label className={`block p-4 rounded-xl border transition cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800' : 'border-stone-200 bg-stone-50 hover:bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="text-amber-800 focus:ring-amber-800"
                      />
                      <div>
                        <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                          <Building2 className="w-4 h-4 text-amber-700" />
                          <span>Direct Bank Transfer (Meezan / Bank Alfalah)</span>
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">Extra 5% Off</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Transfer directly via online banking or ATM. Account details shared after placing order.</p>
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200 text-[11px] text-stone-700 space-y-1">
                      <div className="font-semibold text-amber-900">Shawl Ghar Official Bank Account:</div>
                      <div>Bank: <strong>Meezan Bank Limited</strong></div>
                      <div>Account Title: <strong>Shawl Ghar Textiles</strong></div>
                      <div>IBAN: <strong className="font-mono">PK42MEZN0001234567890123</strong></div>
                    </div>
                  )}
                </label>

                {/* Method: JazzCash / Easypaisa */}
                <label className={`block p-4 rounded-xl border transition cursor-pointer ${paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa' ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800' : 'border-stone-200 bg-stone-50 hover:bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa'}
                        onChange={() => setPaymentMethod('jazzcash')}
                        className="text-amber-800 focus:ring-amber-800"
                      />
                      <div>
                        <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                          <Smartphone className="w-4 h-4 text-orange-600" />
                          <span>JazzCash / Easypaisa Mobile Wallet</span>
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">Extra 5% Off</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Instant transfer from your JazzCash or Easypaisa mobile app.</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Method: Credit/Debit Card */}
                <label className={`block p-4 rounded-xl border transition cursor-pointer ${paymentMethod === 'card' ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800' : 'border-stone-200 bg-stone-50 hover:bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-amber-800 focus:ring-amber-800"
                      />
                      <div>
                        <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-700" />
                          <span>Debit / Credit Card (Visa, Mastercard, PayPak)</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Secure tokenized transaction processed via 3D Secure.</p>
                      </div>
                    </div>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* Sidebar Order Summary (1 Col) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6 sticky top-28">
              <h2 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-stone-400 font-mono font-normal">{items.length} items</span>
              </h2>

              {/* Items mini-list */}
              <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center gap-3 text-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-serif font-bold text-stone-900 truncate">{item.name}</div>
                      <div className="text-stone-400 text-[11px]">Qty: {item.quantity} × {formatPrice(item.unit_price)}</div>
                    </div>
                    <div className="font-mono font-bold text-stone-900">{formatPrice(item.total_price)}</div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-stone-900">{formatPrice(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Coupon Discount</span>
                    </span>
                    <span className="font-mono">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {prepaidDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>5% Prepaid Bonus Savings</span>
                    </span>
                    <span className="font-mono">-{formatPrice(prepaidDiscount)}</span>
                  </div>
                )}

                {giftAddOnTotal > 0 && (
                  <div className="flex justify-between items-center text-rose-800 font-semibold">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      <span>
                        {velvetGiftBox && monogramFee > 0
                          ? 'Velvet Box + Monogram'
                          : velvetGiftBox
                          ? 'Royal Velvet Gift Box'
                          : `Monogram (${monogramInitials.trim()})`}
                      </span>
                    </span>
                    <span className="font-mono">+{formatPrice(giftAddOnTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-stone-600">
                  <div className="space-y-0.5">
                    <div>Shipping Charge</div>
                    <div className="text-[10px] text-stone-400">{shippingMethodName}</div>
                  </div>
                  <span className="font-mono font-bold text-stone-900">
                    {shippingRate === 0 ? <span className="text-emerald-700 uppercase">Free</span> : formatPrice(shippingRate)}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-base font-bold text-stone-900">
                  <span>Total Payable</span>
                  <span className="font-mono text-xl text-amber-900">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {couponStatus && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponStatus}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <>
                      <span>Confirm &amp; Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5 text-[11px] text-stone-400 text-center">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine Handcrafted Kashmiri Guarantee</span>
                </p>
                <p>Madina Clothes Market, Rawalpindi • 5+ Years Experience</p>
              </div>

            </div>
          </div>

        </div>
      </form>

    </div>
  );
}
