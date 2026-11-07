import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  Category,
  Product,
  User,
  Customer,
  CustomerAddress,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Coupon,
  Review,
  ShippingRate,
  InventoryLog,
  formatPrice,
  cleanWhatsAppNumber,
  buildWhatsAppLink,
  slugify,
} from './format';

export type {
  Category,
  Product,
  User,
  Customer,
  CustomerAddress,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Coupon,
  Review,
  ShippingRate,
  InventoryLog,
};
export { formatPrice, cleanWhatsAppNumber, buildWhatsAppLink, slugify };

const dbPath = path.join(process.cwd(), 'data', 'showltown.db');

declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: Database.Database | undefined;
}

export function getDatabase(): Database.Database {
  if (!global.__dbInstance) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    global.__dbInstance = new Database(dbPath);
    global.__dbInstance.pragma('journal_mode = WAL');
    global.__dbInstance.pragma('foreign_keys = ON');

    // Auto-create schema if tables don't exist
    try {
      const hasTables = global.__dbInstance
        .prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='products'")
        .get() as { count: number } | undefined;

      if (!hasTables || hasTables.count === 0) {
        const schemaPath = path.join(process.cwd(), 'scripts', 'init-v2.sql');
        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf8');
          global.__dbInstance.exec(schema);
        }
      }
    } catch (e) {
      console.error('[DB] Schema init check error:', e);
    }
  }
  return global.__dbInstance;
}

// ---------------- PASSWORD HASHING HELPER ----------------

export function hashPassword(password: string, salt = 'shawlghar_salt_seed_2026'): string {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === originalHash;
}

// ---------------- GLOBAL SETTINGS ----------------

export function getSettings(): Record<string, string> {
  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {
    site_name: 'Shawl Ghar',
    site_tagline: '5+ Years of Dedicated Handcrafted Kashmiri Shawls & Artisanal Stoles',
    whatsapp_number: '0313-5209085',
    whatsapp_message:
      'Hello! I would like to order this item from Shawl Ghar:\n\n*{product_name}*\nPrice: {price}\n\nPlease confirm availability and share Cash on Delivery details. Thank you!',
    currency_symbol: 'Rs.',
    currency_code: 'PKR',
    contact_email: 'orders@shawlghar.com',
    contact_address: 'Madina Clothes Market, Rawalpindi, Pakistan',
    experience_years: '5+ Years Experience',
  };

  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export function updateSettings(settings: Record<string, string>): void {
  const db = getDatabase();
  const upsert = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (@key, @value, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);

  const tx = db.transaction((entries: { key: string; value: string }[]) => {
    for (const entry of entries) {
      upsert.run(entry);
    }
  });

  const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
  tx(entries);
}

// ---------------- PRODUCT CATALOG QUERIES ----------------

export function getAllProducts(options?: {
  categoryId?: number;
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
  limit?: number;
  offset?: number;
}): Product[] {
  const db = getDatabase();
  let query = `
    SELECT 
      p.*, 
      c.name AS category_name, 
      c.slug AS category_slug,
      ROUND(COALESCE(AVG(r.rating), 5.0), 1) as rating_avg,
      COUNT(r.id) as rating_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
    WHERE p.is_active = 1
  `;
  const params: any[] = [];

  if (options?.featuredOnly) {
    query += ` AND p.is_featured = 1`;
  }

  if (options?.categoryId) {
    query += ` AND p.category_id = ?`;
    params.push(options.categoryId);
  } else if (options?.categorySlug) {
    query += ` AND c.slug = ?`;
    params.push(options.categorySlug);
  }

  if (options?.search) {
    query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR p.sku LIKE ?)`;
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }

  query += ` GROUP BY p.id`;

  switch (options?.sortBy) {
    case 'price_asc':
      query += ` ORDER BY p.price ASC, p.id DESC`;
      break;
    case 'price_desc':
      query += ` ORDER BY p.price DESC, p.id DESC`;
      break;
    case 'newest':
      query += ` ORDER BY p.id DESC`;
      break;
    case 'rating':
      query += ` ORDER BY rating_avg DESC, p.id DESC`;
      break;
    default:
      query += ` ORDER BY p.is_featured DESC, p.id DESC`;
      break;
  }

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
    if (options.offset) {
      query += ` OFFSET ?`;
      params.push(options.offset);
    }
  }

  return db.prepare(query).all(...params) as Product[];
}

export function getProductById(id: number): Product | undefined {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT 
        p.*, 
        c.name AS category_name, 
        c.slug AS category_slug,
        ROUND(COALESCE(AVG(r.rating), 5.0), 1) as rating_avg,
        COUNT(r.id) as rating_count
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
       WHERE p.id = ?
       GROUP BY p.id`
    )
    .get(id) as Product | undefined;
}

export function getProductBySlug(slug: string): Product | undefined {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT 
        p.*, 
        c.name AS category_name, 
        c.slug AS category_slug,
        ROUND(COALESCE(AVG(r.rating), 5.0), 1) as rating_avg,
        COUNT(r.id) as rating_count
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
       WHERE p.slug = ?
       GROUP BY p.id`
    )
    .get(slug) as Product | undefined;
}

export function getFeaturedProducts(limit = 4): Product[] {
  return getAllProducts({ featuredOnly: true, limit });
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
       WHERE c.slug = ?
       GROUP BY c.id`
    )
    .get(slug) as Category | undefined;
}

export function getProductReviews(productId: number): Review[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY id DESC")
    .all(productId) as Review[];
}

export function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: number;
  image_url: string;
  is_featured?: number;
  stock_status?: string;
  material?: string;
  origin?: string;
}) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO products (
      name, slug, description, price, compare_at_price, category_id,
      image_url, is_featured, stock_status, material, origin
    ) VALUES (
      @name, @slug, @description, @price, @compare_at_price, @category_id,
      @image_url, @is_featured, @stock_status, @material, @origin
    )
  `);
  return stmt.run({
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    compare_at_price: data.compare_at_price || null,
    category_id: data.category_id,
    image_url: data.image_url,
    is_featured: data.is_featured ?? 0,
    stock_status: data.stock_status || 'in_stock',
    material: data.material || 'Premium Pure Wool',
    origin: data.origin || '100% Authentic Hand-Done Kashmiri Needle Embroidery',
  });
}

export function updateProduct(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  compare_at_price?: number | null;
  category_id?: number;
  image_url?: string;
  is_featured?: number;
  stock_status?: string;
  material?: string;
  origin?: string;
}) {
  const db = getDatabase();
  const fields: string[] = [];
  const params: any = { id };

  if (data.name !== undefined) {
    fields.push('name = @name');
    params.name = data.name;
  }
  if (data.slug !== undefined) {
    fields.push('slug = @slug');
    params.slug = data.slug;
  }
  if (data.description !== undefined) {
    fields.push('description = @description');
    params.description = data.description;
  }
  if (data.price !== undefined) {
    fields.push('price = @price');
    params.price = data.price;
  }
  if (data.compare_at_price !== undefined) {
    fields.push('compare_at_price = @compare_at_price');
    params.compare_at_price = data.compare_at_price;
  }
  if (data.category_id !== undefined) {
    fields.push('category_id = @category_id');
    params.category_id = data.category_id;
  }
  if (data.image_url !== undefined) {
    fields.push('image_url = @image_url');
    params.image_url = data.image_url;
  }
  if (data.is_featured !== undefined) {
    fields.push('is_featured = @is_featured');
    params.is_featured = data.is_featured;
  }
  if (data.stock_status !== undefined) {
    fields.push('stock_status = @stock_status');
    params.stock_status = data.stock_status;
  }
  if (data.material !== undefined) {
    fields.push('material = @material');
    params.material = data.material;
  }
  if (data.origin !== undefined) {
    fields.push('origin = @origin');
    params.origin = data.origin;
  }

  if (fields.length === 0) return { changes: 0 };
  fields.push('updated_at = CURRENT_TIMESTAMP');

  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = @id`;
  return db.prepare(sql).run(params);
}

export function deleteProduct(id: number) {
  const db = getDatabase();
  return db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

export function getAdminStats() {
  const db = getDatabase();
  const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any)?.count || 0;
  const totalCategories = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as any)?.count || 0;
  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
  const featuredProducts = (db.prepare('SELECT COUNT(*) as count FROM products WHERE is_featured = 1').get() as any)?.count || 0;
  const inStockCount = (db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_status = 'in_stock'").get() as any)?.count || 0;
  const lowStockCount = (db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_status = 'low_stock'").get() as any)?.count || 0;

  return {
    totalProducts,
    totalCategories,
    totalUsers,
    featuredProducts,
    inStockCount,
    lowStockCount,
    systemStatus: 'Operational',
    dbEngine: 'SQLite 3 (WAL mode)',
  };
}

export function createReview(data: {
  product_id: number;
  customer_id: number;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
}) {
  const db = getDatabase();
  return db
    .prepare(`
      INSERT INTO reviews (product_id, customer_id, customer_name, rating, title, comment, is_verified_purchase, status)
      VALUES (@product_id, @customer_id, @customer_name, @rating, @title, @comment, 1, 'approved')
    `)
    .run(data);
}

// ---------------- CATEGORIES QUERIES ----------------

export function getAllCategories(): Category[] {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
       WHERE c.is_active = 1 OR c.is_active IS NULL
       GROUP BY c.id
       ORDER BY COALESCE(c.display_order, 0) ASC, c.id ASC`
    )
    .all() as Category[];
}

export function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO categories (name, slug, description, image_url)
    VALUES (@name, @slug, @description, @image_url)
  `);
  return stmt.run({
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    image_url: data.image_url || '/images/products/maroon-stole-1.jpg',
  });
}

export function deleteCategory(id: number) {
  const db = getDatabase();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id) as { count: number } | undefined;
  const count = countRow ? countRow.count : 0;
  if (count > 0) {
    throw new Error(`Cannot delete category: ${count} products are currently assigned to it.`);
  }
  return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}

// ---------------- CUSTOMER AUTH & ADDRESSES ----------------

export function registerCustomer(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): { user: User; customer: Customer } {
  const db = getDatabase();
  const email = data.email.toLowerCase().trim();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const tx = db.transaction(() => {
    const userRes = db.prepare(`
      INSERT INTO users (role_id, name, email, password_hash, phone, status)
      VALUES (3, ?, ?, ?, ?, 'active')
    `).run(data.name.trim(), email, hashPassword(data.password), data.phone || null);

    const userId = Number(userRes.lastInsertRowid);

    const custRes = db.prepare(`
      INSERT INTO customers (user_id, loyalty_points)
      VALUES (?, 100)
    `).run(userId);

    const customerId = Number(custRes.lastInsertRowid);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
    const customer = db.prepare(`
      SELECT c.*, u.name, u.email, u.phone 
      FROM customers c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = ?
    `).get(customerId) as Customer;

    return { user, customer };
  });

  return tx();
}

export function authenticateCustomer(email: string, password: string): { user: User; customer: Customer } | null {
  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as User | undefined;
  if (!user) return null;

  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }

  let customer = db.prepare(`
    SELECT c.*, u.name, u.email, u.phone 
    FROM customers c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.user_id = ?
  `).get(user.id) as Customer | undefined;

  // Auto-create customer profile if missing
  if (!customer) {
    const res = db.prepare('INSERT INTO customers (user_id) VALUES (?)').run(user.id);
    customer = {
      id: Number(res.lastInsertRowid),
      user_id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      loyalty_points: 0,
      created_at: new Date().toISOString(),
    };
  }

  // Update last login
  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  return { user, customer };
}

export function getCustomerAddresses(customerId: number): CustomerAddress[] {
  const db = getDatabase();
  return db
    .prepare('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id DESC')
    .all(customerId) as CustomerAddress[];
}

export function addCustomerAddress(data: {
  customer_id: number;
  recipient_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  province: string;
  postal_code?: string;
  is_default?: number;
}) {
  const db = getDatabase();
  if (data.is_default) {
    db.prepare('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?').run(data.customer_id);
  }
  return db.prepare(`
    INSERT INTO customer_addresses (
      customer_id, recipient_name, phone, street_address, apartment,
      city, province, postal_code, is_default
    ) VALUES (@customer_id, @recipient_name, @phone, @street_address, @apartment, @city, @province, @postal_code, @is_default)
  `).run({
    ...data,
    is_default: data.is_default ? 1 : 0,
    apartment: data.apartment || null,
    postal_code: data.postal_code || null,
  });
}

// ---------------- SHOPPING CART ENGINE ----------------

export function getOrCreateCart(sessionToken: string, customerId?: number | null): Cart {
  const db = getDatabase();
  let cartRow = db.prepare('SELECT * FROM carts WHERE session_token = ?').get(sessionToken) as { id: number; customer_id?: number; session_token: string } | undefined;

  if (!cartRow) {
    const res = db.prepare('INSERT INTO carts (session_token, customer_id) VALUES (?, ?)').run(sessionToken, customerId || null);
    cartRow = { id: Number(res.lastInsertRowid), customer_id: customerId || undefined, session_token: sessionToken };
  } else if (customerId && !cartRow.customer_id) {
    db.prepare('UPDATE carts SET customer_id = ? WHERE id = ?').run(customerId, cartRow.id);
  }

  const items = db.prepare(`
    SELECT 
      ci.id, ci.cart_id, ci.product_id, ci.variation_id, ci.quantity, ci.unit_price,
      (ci.quantity * ci.unit_price) as total_price,
      p.name, p.slug, p.image_url, p.stock_quantity, p.stock_status
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ?
    ORDER BY ci.id DESC
  `).all(cartRow.id) as CartItem[];

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cartRow.id,
    customer_id: customerId || null,
    session_token: sessionToken,
    items,
    subtotal,
    item_count: itemCount,
  };
}

export function addToCart(cartId: number, productId: number, quantity = 1, variationId?: number | null) {
  const db = getDatabase();
  const product = db.prepare('SELECT id, price, stock_quantity, stock_status FROM products WHERE id = ?').get(productId) as { id: number; price: number; stock_quantity: number; stock_status: string } | undefined;
  if (!product) throw new Error('Product not found');
  if (product.stock_status === 'out_of_stock' || product.stock_quantity <= 0) {
    throw new Error('This exquisite shawl is currently sold out.');
  }

  const existingItem = db.prepare('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?').get(cartId, productId) as { id: number; quantity: number } | undefined;

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock_quantity) {
      throw new Error(`Only ${product.stock_quantity} pieces available in inventory.`);
    }
    db.prepare('UPDATE cart_items SET quantity = ?, unit_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newQty, product.price, existingItem.id);
  } else {
    if (quantity > product.stock_quantity) {
      throw new Error(`Only ${product.stock_quantity} pieces available in inventory.`);
    }
    db.prepare(`
      INSERT INTO cart_items (cart_id, product_id, variation_id, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?)
    `).run(cartId, productId, variationId || null, quantity, product.price);
  }
}

export function updateCartQuantity(cartItemId: number, quantity: number) {
  const db = getDatabase();
  if (quantity <= 0) {
    return db.prepare('DELETE FROM cart_items WHERE id = ?').run(cartItemId);
  }
  const item = db.prepare(`
    SELECT ci.*, p.stock_quantity 
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.id = ?
  `).get(cartItemId) as { id: number; stock_quantity: number } | undefined;

  if (!item) throw new Error('Cart item not found');
  if (quantity > item.stock_quantity) {
    throw new Error(`Only ${item.stock_quantity} pieces available in stock.`);
  }

  return db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, cartItemId);
}

export function removeFromCart(cartItemId: number) {
  const db = getDatabase();
  return db.prepare('DELETE FROM cart_items WHERE id = ?').run(cartItemId);
}

// ---------------- COUPONS & SHIPPING ----------------

export function validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
  const db = getDatabase();
  const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1').get(code.trim()) as Coupon | undefined;

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
  }

  if (coupon.times_used >= coupon.usage_limit_total) {
    return { valid: false, discount: 0, message: 'This coupon has reached its total usage limit.' };
  }

  if (coupon.min_subtotal && subtotal < coupon.min_subtotal) {
    return { valid: false, discount: 0, message: `Minimum order subtotal of Rs. ${coupon.min_subtotal} required for this coupon.` };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_cap && discount > coupon.max_discount_cap) {
      discount = coupon.max_discount_cap;
    }
  } else {
    discount = coupon.discount_value;
  }

  if (discount > subtotal) discount = subtotal;

  return {
    valid: true,
    discount: Math.round(discount),
    message: `Coupon "${coupon.code}" applied successfully!`,
    coupon,
  };
}

export function getShippingRate(city: string, subtotal: number): { rate: number; name: string; estimatedDays: string } {
  const cleanCity = (city || '').trim().toLowerCase();
  if (cleanCity === 'rawalpindi' || cleanCity === 'islamabad') {
    return {
      rate: subtotal >= 3000 ? 0 : 150,
      name: 'Twin Cities Fast Delivery',
      estimatedDays: '1-2 business days',
    };
  }
  const punjabCities = ['lahore', 'faisalabad', 'multan', 'sialkot', 'gujranwala', 'bahawalpur'];
  if (punjabCities.includes(cleanCity)) {
    return {
      rate: subtotal >= 5000 ? 0 : 250,
      name: 'Punjab Express Delivery',
      estimatedDays: '2-3 business days',
    };
  }
  return {
    rate: subtotal >= 5000 ? 0 : 350,
    name: 'Nationwide Courier (TCS/Leopards)',
    estimatedDays: '2-4 business days',
  };
}

// ---------------- ORDER CREATION & ATOMIC INVENTORY CHECKOUT ----------------

export function createOrderFromCart(params: {
  cartId: number;
  customer_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_street: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code?: string;
  shipping_method?: string;
  payment_method: 'cod' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card';
  coupon_code?: string;
  notes?: string;
}): Order {
  const db = getDatabase();

  const tx = db.transaction(() => {
    // 1. Fetch Cart Items
    const items = db.prepare(`
      SELECT ci.*, p.name as product_name, p.sku as product_sku, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `).all(params.cartId) as (CartItem & { product_name: string; product_sku: string; image_url: string; stock_quantity: number })[];

    if (items.length === 0) {
      throw new Error('Your shopping cart is empty.');
    }

    // 2. Validate inventory for each item
    for (const item of items) {
      if (item.quantity > item.stock_quantity) {
        throw new Error(`Insufficient inventory for "${item.product_name}". Only ${item.stock_quantity} available.`);
      }
    }

    const subtotal = items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);

    // 3. Calculate Discount
    let discountTotal = 0;
    let validatedCouponId: number | null = null;
    if (params.coupon_code) {
      const couponCheck = validateCoupon(params.coupon_code, subtotal);
      if (couponCheck.valid && couponCheck.coupon) {
        discountTotal = couponCheck.discount;
        validatedCouponId = couponCheck.coupon.id;
      }
    }

    // 4. Calculate Shipping
    const shippingInfo = getShippingRate(params.shipping_city, subtotal);
    const shippingTotal = shippingInfo.rate;
    const taxTotal = 0;
    const grandTotal = Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal);

    // 5. Generate Unique Order Number (SG-YYYYMM-XXXX)
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SG-${yearMonth}-${randomSuffix}`;

    const orderRes = db.prepare(`
      INSERT INTO orders (
        order_number, customer_id, customer_name, customer_email, customer_phone,
        shipping_street, shipping_city, shipping_province, shipping_postal_code,
        shipping_method, payment_method, payment_status, order_status,
        subtotal, discount_total, shipping_total, tax_total, grand_total,
        coupon_code, notes
      ) VALUES (
        @order_number, @customer_id, @customer_name, @customer_email, @customer_phone,
        @shipping_street, @shipping_city, @shipping_province, @shipping_postal_code,
        @shipping_method, @payment_method, @payment_status, @order_status,
        @subtotal, @discount_total, @shipping_total, @tax_total, @grand_total,
        @coupon_code, @notes
      )
    `).run({
      order_number: orderNumber,
      customer_id: params.customer_id || null,
      customer_name: params.customer_name.trim(),
      customer_email: params.customer_email.trim().toLowerCase(),
      customer_phone: params.customer_phone.trim(),
      shipping_street: params.shipping_street.trim(),
      shipping_city: params.shipping_city.trim(),
      shipping_province: params.shipping_province.trim(),
      shipping_postal_code: params.shipping_postal_code || null,
      shipping_method: params.shipping_method || shippingInfo.name,
      payment_method: params.payment_method,
      payment_status: params.payment_method === 'cod' ? 'unpaid' : 'pending_verification',
      order_status: 'pending',
      subtotal,
      discount_total: discountTotal,
      shipping_total: shippingTotal,
      tax_total: taxTotal,
      grand_total: grandTotal,
      coupon_code: params.coupon_code || null,
      notes: params.notes || null,
    });

    const orderId = Number(orderRes.lastInsertRowid);

    // 6. Insert Order Items & Decrement Inventory
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, variation_id, product_name, product_sku, image_url,
        unit_price, quantity, total_price
      ) VALUES (@order_id, @product_id, @variation_id, @product_name, @product_sku, @image_url, @unit_price, @quantity, @total_price)
    `);

    const updateProductStock = db.prepare(`
      UPDATE products 
      SET 
        stock_quantity = stock_quantity - @qty,
        stock_status = CASE 
          WHEN stock_quantity - @qty <= 0 THEN 'out_of_stock'
          WHEN stock_quantity - @qty <= low_stock_threshold THEN 'low_stock'
          ELSE 'in_stock'
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    const logInventory = db.prepare(`
      INSERT INTO inventory_logs (product_id, variation_id, change_type, quantity_change, balance_after, reference_order_id, notes)
      VALUES (?, ?, 'order_placed', ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertOrderItem.run({
        order_id: orderId,
        product_id: item.product_id,
        variation_id: item.variation_id || null,
        product_name: item.product_name,
        product_sku: item.product_sku || `SG-${item.product_id}`,
        image_url: item.image_url,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.unit_price * item.quantity,
      });

      updateProductStock.run({ id: item.product_id, qty: item.quantity });
      const newStock = item.stock_quantity - item.quantity;
      logInventory.run(item.product_id, item.variation_id || null, -item.quantity, newStock, orderId, `Order #${orderNumber}`);
    }

    // 7. Record Status History
    db.prepare(`
      INSERT INTO order_status_history (order_id, to_status, comment)
      VALUES (?, 'pending', 'Order placed successfully by customer')
    `).run(orderId);

    // 8. Record Payment Record
    db.prepare(`
      INSERT INTO payments (order_id, payment_method, amount, status)
      VALUES (?, ?, ?, ?)
    `).run(orderId, params.payment_method, grandTotal, 'pending');

    // 9. Update Coupon Usage if applicable
    if (validatedCouponId) {
      db.prepare(`
        INSERT INTO coupon_usages (coupon_id, order_id, customer_id, discount_amount)
        VALUES (?, ?, ?, ?)
      `).run(validatedCouponId, orderId, params.customer_id || null, discountTotal);

      db.prepare('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?').run(validatedCouponId);
    }

    // 10. Clear Cart
    db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(params.cartId);

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order;
    createdOrder.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as OrderItem[];

    return createdOrder;
  });

  return tx();
}

export function getOrderByNumber(orderNumber: string): (Order & { items: OrderItem[] }) | undefined {
  const db = getDatabase();
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as Order | undefined;
  if (!order) return undefined;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as OrderItem[];
  return { ...order, items };
}

export function getCustomerOrders(customerId: number): Order[] {
  const db = getDatabase();
  const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC').all(customerId) as Order[];
  for (const o of orders) {
    o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as OrderItem[];
  }
  return orders;
}

export function updateOrderStatus(orderId: number, newStatus: string, comment?: string, changedByUserId?: number) {
  const db = getDatabase();
  const current = db.prepare('SELECT order_status FROM orders WHERE id = ?').get(orderId) as { order_status: string } | undefined;
  if (!current) throw new Error('Order not found');

  const tx = db.transaction(() => {
    db.prepare('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, orderId);
    db.prepare(`
      INSERT INTO order_status_history (order_id, from_status, to_status, comment, changed_by_user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(orderId, current.order_status, newStatus, comment || null, changedByUserId || null);
  });

  return tx();
}

// ---------------- ADMIN MANAGEMENT & ANALYTICS ----------------

export function getAdminDashboardStats() {
  const db = getDatabase();

  const totalRevenue = (db.prepare("SELECT COALESCE(SUM(grand_total), 0) as rev FROM orders WHERE order_status != 'cancelled'").get() as any).rev;
  const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
  const pendingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'").get() as any).count;
  const deliveredOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'delivered'").get() as any).count;
  const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
  const lowStockCount = (db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_quantity <= low_stock_threshold").get() as any).count;
  const totalCustomers = (db.prepare('SELECT COUNT(*) as count FROM customers').get() as any).count;

  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all() as Order[];
  const lowStockProducts = db.prepare('SELECT id, name, sku, stock_quantity, low_stock_threshold, price FROM products WHERE stock_quantity <= low_stock_threshold LIMIT 5').all();

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalProducts,
    lowStockCount,
    totalCustomers,
    recentOrders,
    lowStockProducts,
  };
}

export function getAllOrdersAdmin(statusFilter?: string): Order[] {
  const db = getDatabase();
  let query = 'SELECT * FROM orders';
  const params: any[] = [];
  if (statusFilter && statusFilter !== 'all') {
    query += ' WHERE order_status = ?';
    params.push(statusFilter);
  }
  query += ' ORDER BY id DESC';
  const orders = db.prepare(query).all(...params) as Order[];
  for (const o of orders) {
    o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as OrderItem[];
  }
  return orders;
}

export function adjustInventoryStock(productId: number, qtyChange: number, notes?: string) {
  const db = getDatabase();
  const prod = db.prepare('SELECT id, stock_quantity, low_stock_threshold FROM products WHERE id = ?').get(productId) as { id: number; stock_quantity: number; low_stock_threshold: number } | undefined;
  if (!prod) throw new Error('Product not found');

  const newStock = Math.max(0, prod.stock_quantity + qtyChange);
  const status = newStock === 0 ? 'out_of_stock' : newStock <= prod.low_stock_threshold ? 'low_stock' : 'in_stock';

  const tx = db.transaction(() => {
    db.prepare('UPDATE products SET stock_quantity = ?, stock_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStock, status, productId);
    db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity_change, balance_after, notes)
      VALUES (?, 'manual_adjustment', ?, ?, ?)
    `).run(productId, qtyChange, newStock, notes || 'Manual Admin Stock Adjustment');
  });

  return tx();
}

export function getInventoryLogs(limit = 20): InventoryLog[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT il.*, p.name as product_name 
    FROM inventory_logs il
    JOIN products p ON il.product_id = p.id
    ORDER BY il.id DESC
    LIMIT ?
  `).all(limit) as InventoryLog[];
}

export function getAllCouponsAdmin(): Coupon[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM coupons ORDER BY id DESC').all() as Coupon[];
}

export function createCoupon(data: {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_subtotal?: number;
  max_discount_cap?: number;
  usage_limit_total?: number;
}) {
  const db = getDatabase();
  return db.prepare(`
    INSERT INTO coupons (
      code, description, discount_type, discount_value, min_subtotal, max_discount_cap, usage_limit_total
    ) VALUES (@code, @description, @discount_type, @discount_value, @min_subtotal, @max_discount_cap, @usage_limit_total)
  `).run({
    ...data,
    code: data.code.toUpperCase().trim(),
    min_subtotal: data.min_subtotal || 0,
    max_discount_cap: data.max_discount_cap || null,
    usage_limit_total: data.usage_limit_total || 100,
  });
}

export function toggleCouponActive(id: number, isActive: number) {
  const db = getDatabase();
  return db.prepare('UPDATE coupons SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);
}

export function deleteCoupon(id: number) {
  const db = getDatabase();
  return db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
}

export function getAllCustomersAdmin(): any[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT 
      c.id, u.name, u.email, u.phone, u.status as is_active, c.loyalty_points, c.created_at,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(CASE WHEN o.order_status != 'cancelled' THEN o.grand_total ELSE 0 END), 0) as total_spent,
      MAX(o.created_at) as last_order_date
    FROM customers c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id
    ORDER BY c.id DESC
  `).all();
}

export function updateOrderTracking(orderId: number, courier: string, trackingNumber: string) {
  const db = getDatabase();
  return db.prepare('UPDATE orders SET courier_name = ?, tracking_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(courier, trackingNumber, orderId);
}

// ---------------- USER & AUTH COMPATIBILITY ----------------

export function getUserByEmail(email: string): User | undefined {
  const db = getDatabase();
  return db.prepare(`
    SELECT u.*, r.name as role 
    FROM users u 
    LEFT JOIN roles r ON u.role_id = r.id 
    WHERE u.email = ?
  `).get(email.toLowerCase().trim()) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const db = getDatabase();
  return db.prepare(`
    SELECT u.*, r.name as role 
    FROM users u 
    LEFT JOIN roles r ON u.role_id = r.id 
    WHERE u.id = ?
  `).get(id) as User | undefined;
}

export default getDatabase;
