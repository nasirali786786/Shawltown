export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order?: number;
  is_active?: number;
  created_at: string;
  product_count?: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sku?: string | null;
  short_description?: string | null;
  description: string;
  price: number;
  compare_at_price: number | null;
  cost_price?: number | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  category_name?: string;
  category_slug?: string;
  image_url: string;
  additional_images?: string | null;
  is_featured: number;
  is_active: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  material?: string | null;
  origin?: string | null;
  dimensions?: string | null;
  weight_grams?: number;
  rating_avg?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  role_id: number;
  name: string;
  email: string;
  password_hash: string;
  phone?: string | null;
  role: 'super_admin' | 'store_manager' | 'customer' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string | null;
  loyalty_points: number;
  notes?: string | null;
  created_at: string;
}

export interface CustomerAddress {
  id: number;
  customer_id: number;
  address_type: 'shipping' | 'billing' | 'both';
  recipient_name: string;
  phone: string;
  street_address: string;
  apartment?: string | null;
  city: string;
  province: string;
  postal_code?: string | null;
  is_default: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variation_id?: number | null;
  name: string;
  slug: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  stock_quantity: number;
  stock_status: string;
}

export interface Cart {
  id: number;
  customer_id?: number | null;
  session_token: string;
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variation_id?: number | null;
  product_name: string;
  product_sku?: string | null;
  image_url?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_street: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code?: string | null;
  shipping_method: string;
  payment_method: 'cod' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card';
  payment_status: 'unpaid' | 'pending_verification' | 'paid' | 'failed' | 'refunded';
  order_status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'refunded';
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  coupon_code?: string | null;
  tracking_number?: string | null;
  courier_name?: string | null;
  notes?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_subtotal: number;
  max_discount_cap?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_limit_total: number;
  usage_limit_per_user: number;
  times_used: number;
  is_active: number;
}

export interface Review {
  id: number;
  product_id: number;
  customer_id: number;
  customer_name: string;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified_purchase: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ShippingZone {
  id: number;
  name: string;
  provinces: string[];
  cities: string[];
  is_active: number;
}

export interface ShippingRate {
  id: number;
  zone_id: number;
  name: string;
  rate: number;
  free_shipping_threshold?: number | null;
  estimated_days: string;
  is_active: number;
}

export interface InventoryLog {
  id: number;
  product_id: number;
  product_name?: string;
  change_type: 'order_placed' | 'order_cancelled' | 'manual_adjustment' | 'restock' | 'return_restock';
  quantity_change: number;
  balance_after: number;
  reference_order_id?: number | null;
  notes?: string | null;
  created_at: string;
}

/**
 * Format price in Pakistani Rupees (e.g. Rs. 2,800)
 */
export function formatPrice(amount: number, symbol = 'Rs.'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol} 0`;
  const formatted = Math.round(amount).toLocaleString('en-PK');
  return `${symbol} ${formatted}`;
}

/**
 * Clean phone number for WhatsApp link (e.g. 0313-5209085 -> 923135209085)
 */
export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return '923135209085';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    return '92' + digits.substring(1);
  }
  if (!digits.startsWith('92') && digits.length === 10) {
    return '92' + digits;
  }
  return digits;
}

/**
 * Generate click-to-chat WhatsApp link
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = cleanWhatsAppNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Convert string into URL slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
