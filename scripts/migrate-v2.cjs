const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const crypto = require('crypto');

function hashPassword(password, salt = 'shawlghar_salt_seed_2026') {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'showltown.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log(`[Migration V2] Running migration on: ${dbPath}`);

function ensureColumn(table, column, def) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = cols.some((c) => c.name === column);
  if (!exists) {
    console.log(`[Migration V2] Adding column '${column}' to table '${table}'...`);
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`).run();
  }
}

// 1. Create independent new tables first
db.exec(`
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
`);

// 2. Ensure existing tables have V2 columns
ensureColumn('users', 'role_id', 'INTEGER DEFAULT 3');
ensureColumn('users', 'phone', 'TEXT');
ensureColumn('users', 'status', 'TEXT DEFAULT "active"');
ensureColumn('users', 'last_login', 'DATETIME');

ensureColumn('categories', 'parent_id', 'INTEGER');
ensureColumn('categories', 'display_order', 'INTEGER DEFAULT 0');
ensureColumn('categories', 'is_active', 'INTEGER DEFAULT 1');

ensureColumn('products', 'sku', 'TEXT');
ensureColumn('products', 'short_description', 'TEXT');
ensureColumn('products', 'cost_price', 'REAL');
ensureColumn('products', 'stock_quantity', 'INTEGER DEFAULT 10');
ensureColumn('products', 'low_stock_threshold', 'INTEGER DEFAULT 3');
ensureColumn('products', 'dimensions', 'TEXT');
ensureColumn('products', 'weight_grams', 'INTEGER DEFAULT 350');

// 3. Execute full V2 schema for all remaining tables
const schemaPath = path.join(__dirname, 'init-v2.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('[Migration V2] Created/Verified all 28 normalized relational tables.');

// 4. Seed Default Roles
const insertRole = db.prepare('INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)');
insertRole.run(1, 'super_admin', 'Full administrative system access');
insertRole.run(2, 'store_manager', 'Catalog, inventory, and order operations');
insertRole.run(3, 'customer', 'Registered customer with purchasing privileges');

// 5. Seed Default Permissions
const permissions = [
  ['manage_products', 'catalog', 'Create, edit, delete products'],
  ['manage_categories', 'catalog', 'Create, edit, delete categories'],
  ['manage_orders', 'orders', 'View, update status, cancel orders'],
  ['manage_inventory', 'inventory', 'Adjust stock and view logs'],
  ['manage_coupons', 'promotions', 'Create and modify discount codes'],
  ['manage_customers', 'customers', 'View and manage customer accounts'],
  ['manage_settings', 'system', 'Global brand, WhatsApp, and payment settings'],
];
const insertPermission = db.prepare('INSERT OR IGNORE INTO permissions (name, module, description) VALUES (?, ?, ?)');
for (const p of permissions) {
  insertPermission.run(p[0], p[1], p[2]);
}

// 6. Assign permissions to Admin & Manager
const insertRolePerm = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
const allPerms = db.prepare('SELECT id FROM permissions').all();
for (const perm of allPerms) {
  insertRolePerm.run(1, perm.id); // Super Admin gets all
  if (perm.id <= 5) {
    insertRolePerm.run(2, perm.id); // Manager gets catalog, orders, inventory, coupons
  }
}

// 7. Seed Shipping Zones for Pakistan
const insertZone = db.prepare('INSERT OR IGNORE INTO shipping_zones (id, name, provinces, cities, is_active) VALUES (?, ?, ?, ?, ?)');
insertZone.run(
  1,
  'Twin Cities (Rawalpindi & Islamabad)',
  JSON.stringify(['Punjab', 'Islamabad Capital Territory']),
  JSON.stringify(['Rawalpindi', 'Islamabad']),
  1
);
insertZone.run(
  2,
  'Punjab Major Metropolitan',
  JSON.stringify(['Punjab']),
  JSON.stringify(['Lahore', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur']),
  1
);
insertZone.run(
  3,
  'Nationwide Standard (Sindh, KPK, Balochistan, GB, AJK)',
  JSON.stringify(['Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Jammu & Kashmir']),
  JSON.stringify(['Karachi', 'Hyderabad', 'Sukkur', 'Peshawar', 'Abbottabad', 'Quetta', 'Muzaffarabad']),
  1
);

// 8. Seed Shipping Rates
const insertRate = db.prepare('INSERT OR IGNORE INTO shipping_rates (id, zone_id, name, rate, free_shipping_threshold, estimated_days, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)');
insertRate.run(1, 1, 'Local Same-Day / Next-Day Delivery', 150.00, 3000.00, '1 business day', 1);
insertRate.run(2, 2, 'Punjab Express Courier', 250.00, 5000.00, '2 business days', 1);
insertRate.run(3, 3, 'Nationwide TCS / Leopards Courier', 350.00, 5000.00, '2-4 business days', 1);

// 9. Seed Sample Promotional Coupons
const insertCoupon = db.prepare(`
  INSERT OR IGNORE INTO coupons (
    id, code, description, discount_type, discount_value, min_subtotal, max_discount_cap,
    start_date, end_date, usage_limit_total, usage_limit_per_user, is_active
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    datetime('now'), datetime('now', '+3 months'), ?, ?, ?
  )
`);
insertCoupon.run(1, 'WELCOME10', '10% Off on your first Kashmiri Shawl purchase', 'percentage', 10.0, 2000.0, 1000.0, 500, 1, 1);
insertCoupon.run(2, 'WINTER500', 'Flat Rs. 500 discount on orders above Rs. 4,000', 'fixed', 500.0, 4000.0, 500.0, 200, 1, 1);
insertCoupon.run(3, 'ROYALSHAWL', '15% Off Luxury Pashmina & Bridal Wraps', 'percentage', 15.0, 8000.0, 2500.0, 100, 2, 1);

// 10. Ensure Admin User has role_id = 1
db.prepare('UPDATE users SET role_id = 1 WHERE email = ?').run('admin@showltown.com');

// 11. Create a Sample Customer Account if not exists
const existingCustUser = db.prepare('SELECT id FROM users WHERE email = ?').get('customer@shawlghar.com');
let customerUserId;
if (!existingCustUser) {
  const res = db.prepare(`
    INSERT INTO users (role_id, name, email, password_hash, phone, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(3, 'Ayesha Khan', 'customer@shawlghar.com', hashPassword('customer123'), '0300-1234567', 'active');
  customerUserId = res.lastInsertRowid;
} else {
  customerUserId = existingCustUser.id;
}

const existingCustomer = db.prepare('SELECT id FROM customers WHERE user_id = ?').get(customerUserId);
let customerRecordId;
if (!existingCustomer) {
  const res = db.prepare('INSERT INTO customers (user_id, loyalty_points, notes) VALUES (?, ?, ?)').run(customerUserId, 150, 'VIP Shawl collector');
  customerRecordId = res.lastInsertRowid;
} else {
  customerRecordId = existingCustomer.id;
}

// 12. Seed Customer Address
const existingAddr = db.prepare('SELECT id FROM customer_addresses WHERE customer_id = ?').get(customerRecordId);
if (!existingAddr) {
  db.prepare(`
    INSERT INTO customer_addresses (
      customer_id, address_type, recipient_name, phone, street_address,
      apartment, city, province, postal_code, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    customerRecordId,
    'both',
    'Ayesha Khan',
    '0300-1234567',
    'House 42, Street 7, F-7/2',
    'Villa B',
    'Islamabad',
    'Islamabad Capital Territory',
    '44000',
    1
  );
}

// 13. Populate SKU and Stock on existing products if missing
const products = db.prepare('SELECT id, name, price, stock_quantity FROM products').all();
const updateProd = db.prepare(`
  UPDATE products
  SET sku = @sku, stock_quantity = @stock_quantity, low_stock_threshold = @low_stock_threshold
  WHERE id = @id AND (sku IS NULL OR sku = '')
`);

for (const p of products) {
  const sku = `SG-${p.id.toString().padStart(4, '0')}`;
  updateProd.run({
    id: p.id,
    sku,
    stock_quantity: 15,
    low_stock_threshold: 3
  });

  // Seed sample initial inventory log
  const existingLog = db.prepare('SELECT id FROM inventory_logs WHERE product_id = ?').get(p.id);
  if (!existingLog) {
    db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity_change, balance_after, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(p.id, 'restock', 15, 15, 'Initial handcrafted collection stock');
  }
}

// 14. Seed sample reviews for products
const sampleReviews = [
  { rating: 5, title: 'Breathtaking needlework & pure warmth', comment: 'The quality of the Kashmiri embroidery is truly authentic. Soft fabric, elegant drape, and fast delivery in Islamabad!' },
  { rating: 5, title: 'Royal look, worth every rupee', comment: 'Ordered this for a family wedding. Everyone gave compliments on the intricate border work. Highly recommended!' },
  { rating: 4, title: 'Very soft and lightweight', comment: 'The wool is genuinely premium. Kept me cozy throughout winter evenings. Cash on Delivery was prompt.' }
];

const insertReview = db.prepare(`
  INSERT OR IGNORE INTO reviews (product_id, customer_id, customer_name, rating, title, comment, is_verified_purchase, status)
  VALUES (?, ?, ?, ?, ?, ?, 1, 'approved')
`);

for (const p of products.slice(0, 5)) {
  for (let i = 0; i < sampleReviews.length; i++) {
    const rev = sampleReviews[i];
    insertReview.run(p.id, customerRecordId, ['Farah Malik', 'Zainab Bibi', 'Hina Tariq'][i], rev.rating, rev.title, rev.comment);
  }
}

console.log('[Migration V2] Migration and comprehensive data seeding finished successfully!');
db.close();
