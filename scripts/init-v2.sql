-- ==============================================================================
-- SHAWL GHAR (شال گھر) — ENTERPRISE E-COMMERCE RELATIONAL DATABASE SCHEMA (V2)
-- Architecture: 28 Normalized Relational Tables
-- Target Engine: SQLite 3 (WAL Mode) / Fully Portable to PostgreSQL
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- DOMAIN 1: IDENTITY, ROLES & PERMISSIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    module TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL DEFAULT 3, -- 1: SuperAdmin, 2: Manager, 3: Customer
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'pending')),
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    loyalty_points INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    address_type TEXT DEFAULT 'shipping' CHECK(address_type IN ('shipping', 'billing', 'both')),
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    apartment TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT,
    is_default INTEGER DEFAULT 0 CHECK(is_default IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);

-- -----------------------------------------------------------------------------
-- DOMAIN 2: TAXONOMY & PRODUCT CATALOG
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT UNIQUE,
    short_description TEXT,
    description TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    compare_at_price REAL,
    cost_price REAL,
    stock_quantity INTEGER DEFAULT 10,
    low_stock_threshold INTEGER DEFAULT 3,
    stock_status TEXT DEFAULT 'in_stock' CHECK(stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    is_featured INTEGER DEFAULT 0 CHECK(is_featured IN (0, 1)),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    material TEXT,
    origin TEXT,
    dimensions TEXT,
    weight_grams INTEGER DEFAULT 350,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary INTEGER DEFAULT 0 CHECK(is_primary IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

CREATE TABLE IF NOT EXISTS product_attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- e.g., Color, Fabric, Weave Style, Size
    slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS product_attribute_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attribute_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    hex_color TEXT,
    FOREIGN KEY (attribute_id) REFERENCES product_attributes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    price_override REAL,
    stock_quantity INTEGER DEFAULT 5,
    image_url TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variation_values (
    variation_id INTEGER NOT NULL,
    attribute_value_id INTEGER NOT NULL,
    PRIMARY KEY (variation_id, attribute_value_id),
    FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_value_id) REFERENCES product_attribute_values(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- DOMAIN 3: SHOPPING CART & WISHLIST
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    session_token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'merged', 'converted', 'abandoned')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_token);
CREATE INDEX IF NOT EXISTS idx_carts_customer ON carts(customer_id);

CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    variation_id INTEGER,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
    unit_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE SET NULL,
    UNIQUE(cart_id, product_id, variation_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(customer_id, product_id)
);

-- -----------------------------------------------------------------------------
-- DOMAIN 4: ORDERS & ORDER STATE MACHINE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE, -- e.g., SG-2026-1001
    customer_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_street TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_province TEXT NOT NULL,
    shipping_postal_code TEXT,
    shipping_method TEXT NOT NULL DEFAULT 'standard',
    payment_method TEXT NOT NULL DEFAULT 'cod', -- cod, bank_transfer, jazzcash, easypaisa, card
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'pending_verification', 'paid', 'failed', 'refunded')),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK(order_status IN (
        'pending', 'confirmed', 'processing', 'packed', 'shipped',
        'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'
    )),
    subtotal REAL NOT NULL,
    discount_total REAL DEFAULT 0,
    shipping_total REAL DEFAULT 0,
    tax_total REAL DEFAULT 0,
    grand_total REAL NOT NULL,
    coupon_code TEXT,
    tracking_number TEXT,
    courier_name TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    variation_id INTEGER,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    image_url TEXT,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    total_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    comment TEXT,
    changed_by_user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- DOMAIN 5: PAYMENTS & SHIPPING LOGISTICS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'PKR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_reference TEXT,
    receipt_image_url TEXT,
    gateway_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- authorize, capture, refund, void
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    raw_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipping_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- e.g., Twin Cities (Rawalpindi/Islamabad), Punjab, Nationwide
    provinces TEXT, -- JSON array
    cities TEXT, -- JSON array
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS shipping_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER NOT NULL,
    name TEXT NOT NULL, -- Standard Courier, Express Delivery
    rate REAL NOT NULL DEFAULT 0,
    free_shipping_threshold REAL,
    estimated_days TEXT NOT NULL DEFAULT '2-4 business days',
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    FOREIGN KEY (zone_id) REFERENCES shipping_zones(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- DOMAIN 6: INVENTORY LOGS, COUPONS, REVIEWS & AUDIT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS inventory_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    variation_id INTEGER,
    change_type TEXT NOT NULL CHECK(change_type IN ('order_placed', 'order_cancelled', 'manual_adjustment', 'restock', 'return_restock')),
    quantity_change INTEGER NOT NULL, -- negative for deduction, positive for addition
    balance_after INTEGER NOT NULL,
    reference_order_id INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (reference_order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);

CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
    discount_value REAL NOT NULL CHECK(discount_value > 0),
    min_subtotal REAL DEFAULT 0,
    max_discount_cap REAL,
    start_date DATETIME,
    end_date DATETIME,
    usage_limit_total INTEGER DEFAULT 100,
    usage_limit_per_user INTEGER DEFAULT 1,
    times_used INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    customer_id INTEGER,
    discount_amount REAL NOT NULL,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    is_verified_purchase INTEGER DEFAULT 1 CHECK(is_verified_purchase IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'approved' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_type TEXT NOT NULL CHECK(recipient_type IN ('admin', 'customer')),
    recipient_user_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- SYSTEM SETTINGS TABLE (DYNAMIC BRAND, WHATSAPP & PAYMENTS CONFIG)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
