# Shawl Ghar (شال گھر) — Implementation Roadmap & Atomic Task Queue

## Status Legend
- [x] Completed & Verified
- [/] In Progress
- [ ] Queued / Pending

---

## Milestone 1: Database Schema Expansion & Migration
- [x] **Task 1.1: Extended Migration Script** (`scripts/migrate-v2.cjs`)
  - Created the 28 normalized tables defined in `PRD.md`.
  - Established foreign key relationships, cascading deletes, unique indexes, and audit triggers.
- [x] **Task 1.2: Backward-Compatible Data Migration**
  - Seamlessly migrated existing 9 products, 6 categories, 2 users, and settings without data loss.
  - Populated initial shipping zones (Punjab, Sindh, KPK, Balochistan, Islamabad/Rawalpindi).
- [x] **Task 1.3: Extended Database Access Layer** (`lib/db.ts`)
  - Added query interfaces for customers, addresses, carts, orders, payments, coupons, reviews, and inventory logs.

---

## Milestone 2: Customer Identity, Auth & Address Management
- [x] **Task 2.1: Customer Registration & Login API** (`app/api/auth/...`)
  - Register new customer with password hashing and validation (`/api/auth/register`).
  - Customer login and session verification (`/api/auth/customer-login`, `/api/auth/customer-me`).
- [x] **Task 2.2: Customer Auth UI Components**
  - Dedicated `/account/login` and `/account` dashboard.
  - Real-time customer header status and login links.
- [x] **Task 2.3: Customer Profile & Address Book** (`/api/customer/addresses`)
  - Manage multiple delivery addresses (Home, Office).
  - City dropdowns for Pakistani destinations (Rawalpindi, Islamabad, Lahore, Karachi, Peshawar, etc.).

---

## Milestone 3: Dynamic Shopping Cart Engine
- [x] **Task 3.1: Cart State Management & Context** (`context/CartContext.tsx`)
  - React Context with persistent cart token and server synchronization.
  - Real-time subtotal, quantity updates, and item removal.
- [x] **Task 3.2: Slide-Over Drawer & Dedicated Cart Page** (`components/CartDrawer.tsx` & `app/cart/page.tsx`)
  - Slide-over mini-cart drawer triggering on "Add to Bag".
  - Full-page cart table with shipping calculator and coupon code input.
- [x] **Task 3.3: Server-Side Cart Pricing & Stock Guard** (`app/api/cart/...`)
  - Validates stock quantities and recalculates prices on the server.

---

## Milestone 4: Checkout & Multi-Payment Processing Engine
- [x] **Task 4.1: Seamless Multi-Step Checkout Page** (`app/checkout/page.tsx`)
  - Step 1: Customer Contact & Delivery Address.
  - Step 2: Shipping Method (Zoned for Twin Cities, Punjab, Nationwide).
  - Step 3: Payment Method Selection.
  - Step 4: Order Review & Confirmation.
- [x] **Task 4.2: Payment Gateway Adapters**
  - **Cash on Delivery (COD)**: Default for Pakistan.
  - **Direct Bank Transfer**: Displays Meezan Bank IBAN with transaction reference entry.
  - **JazzCash / Easypaisa**: Mobile wallet instructions and account numbering.
  - **Credit/Debit Card**: Secure gateway processing card inputs.
- [x] **Task 4.3: Order Placement Transaction** (`app/api/checkout/route.ts`)
  - Atomic transaction: decrement inventory, log inventory movement, apply coupon usage, create order + order items, clear cart.

---

## Milestone 5: Order Lifecycle, Tracking & Printable Invoices
- [x] **Task 5.1: Order Success & Tracking Page** (`app/order-success/[orderNumber]/page.tsx`)
  - Visual status timeline (Pending -> Confirmed -> Packed -> Shipped -> Delivered).
  - Courier tracking info.
- [x] **Task 5.2: Customer Order History** (`app/account/page.tsx` & `/api/customer/orders`)
  - Past and active orders with itemized views.
- [x] **Task 5.3: Printable PDF / HTML Invoice Generator**
  - Branded Shawl Ghar printable invoice with order number, shop address (Madina Clothes Market Rawalpindi), items, and COD totals.

---

## Milestone 6: Product Variations & Inventory Logs
- [x] **Task 6.1: Product Display & Cart Integration** (`components/ProductCard.tsx` & `components/ProductDetailView.tsx`)
  - "Add to Bag" and "Instant Checkout" buttons.
  - Live stock status badges and quantity counter.
- [x] **Task 6.2: Alternative Concierge Channel**
  - Direct WhatsApp hotline ordering (`0313-5209085`) on every card and detail view.
- [x] **Task 6.3: Inventory Movement Audit Logs** (`/admin/inventory`)
  - Automated stock change audit logs (Order Placement, Restock, Manual Adjustment).

---

## Milestone 7: Coupons, Promotions & Customer Reviews
- [x] **Task 7.1: Flexible Coupon Engine** (`app/api/coupons/validate` & `app/admin/coupons`)
  - Percentage discounts, fixed rupee deductions, min spend, and max cap rules.
- [x] **Task 7.2: Product Reviews & Rating Submissions** (`app/api/products/[id]/reviews`)
  - Star ratings (1-5), review comments, and verified buyer badges.

---

## Milestone 8: Full Enterprise Admin Dashboard
- [x] **Task 8.1: Executive Analytics Dashboard** (`/admin`)
  - KPI cards: Gross Sales, Orders by Status, Registered Patrons CRM, Low Stock Alerts.
- [x] **Task 8.2: Comprehensive Order Management** (`/admin/orders`)
  - Filter by statuses, advance order lifecycle, assign courier tracking numbers, print invoices.
- [x] **Task 8.3: Inventory & Stock Adjustment Center** (`/admin/inventory`)
  - Real-time stock overview, low stock alerts (< 5 items), stock adjustment modal, immutable audit log.
- [x] **Task 8.4: Coupon & Promotions Center** (`/admin/coupons`)
  - Create, toggle, and delete promotional discount codes.
- [x] **Task 8.5: Customer Relationship Management (CRM)** (`/admin/customers`)
  - Registered customer accounts, purchasing history, and lifetime spend in PKR.

---

## Milestone 9: Automated End-to-End Verification & Deployment
- [x] **Task 9.1: Automated Test Script** (`scripts/verify-full-platform.mjs`)
  - 8-stage automated test verifying auth, cart, coupon, checkout, inventory decrement, order history, admin management, and reviews.
  - Verified exit code `0`.
- [x] **Task 9.2: Production Build & Git Remote Sync**
  - `npm run build` compiled successfully in Turbopack.
  - Commits pushed to `https://github.com/nasirali786786/Shawltown.git` for automatic deployment to Render.
