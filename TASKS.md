# Shawl Ghar (شال گھر) — Implementation Roadmap & Atomic Task Queue

## Status Legend
- [x] Completed & Verified
- [/] In Progress
- [ ] Queued / Pending

---

## Milestone 1: Database Schema Expansion & Migration
- [ ] **Task 1.1: Extended Migration Script** (`scripts/migrate-v2.cjs`)
  - Create the 28 normalized tables defined in `PRD.md`.
  - Establish foreign key relationships, cascading deletes, unique indexes, and audit triggers.
- [ ] **Task 1.2: Backward-Compatible Data Migration**
  - Seamlessly migrate existing 9 products, 6 categories, 2 users, and settings without data loss.
  - Populate initial shipping zones (Punjab, Sindh, KPK, Balochistan, Islamabad/Rawalpindi).
- [ ] **Task 1.3: Extended Database Access Layer** (`lib/db-v2.ts`)
  - Add query interfaces for customers, addresses, carts, orders, payments, coupons, reviews, and inventory logs.

---

## Milestone 2: Customer Identity, Auth & Address Management
- [ ] **Task 2.1: Customer Registration & Login API** (`app/api/auth/customer/...`)
  - Register new customer with password hashing and validation.
  - Unified session management supporting both Admin and Customer roles.
- [ ] **Task 2.2: Customer Auth UI Components**
  - Modern modal or dedicated `/account/login` and `/account/register` pages.
  - Floating account badge in Header with dropdown (Orders, Profile, Wishlist, Logout).
- [ ] **Task 2.3: Customer Profile & Address Book** (`/account/addresses`)
  - Manage multiple delivery addresses (Home, Office).
  - City dropdowns for major Pakistani destinations (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad, Sialkot, etc.).

---

## Milestone 3: Dynamic Shopping Cart Engine
- [ ] **Task 3.1: Cart State Management & Context** (`context/CartContext.tsx`)
  - LocalStorage optimistic cart with automatic server synchronization for authenticated customers.
  - Real-time subtotal, quantity updates, and item removal.
- [ ] **Task 3.2: Slide-Over Drawer & Dedicated Cart Page** (`components/CartDrawer.tsx` & `app/cart/page.tsx`)
  - Modern slide-over mini-cart on navbar click.
  - Full-page cart table with shipping calculator and coupon code input.
- [ ] **Task 3.3: Server-Side Cart Pricing & Stock Guard** (`app/api/cart/...`)
  - Validate stock quantities and recalculate prices on the server to prevent tamper attacks.

---

## Milestone 4: Checkout & Multi-Payment Processing Engine
- [ ] **Task 4.1: Seamless Multi-Step Checkout Page** (`app/checkout/page.tsx`)
  - Step 1: Customer Info & Delivery Address.
  - Step 2: Shipping Method (Standard Courier vs. Express Delivery).
  - Step 3: Payment Method Selection.
  - Step 4: Order Review & Confirmation.
- [ ] **Task 4.2: Payment Gateway Adapters** (`lib/payments/...`)
  - **Cash on Delivery (COD)**: Default for Pakistan with phone verification toggle.
  - **Direct Bank Transfer**: Displays Shawl Ghar IBAN/Account details with receipt upload / reference entry.
  - **JazzCash / Easypaisa**: Mobile wallet payment instructions and reference code verification.
  - **Credit/Debit Card (Stripe / Gateway)**: Secure tokenized processing.
- [ ] **Task 4.3: Order Placement Transaction** (`app/api/checkout/route.ts`)
  - Atomic transaction: decrement inventory, log inventory movement, apply coupon usage, create order + order items, clear cart.

---

## Milestone 5: Order Lifecycle, Tracking & Printable Invoices
- [ ] **Task 5.1: Order Success & Tracking Page** (`app/order-success/[orderNumber]/page.tsx`)
  - Visual timeline displaying order status (Pending -> Confirmed -> Packed -> Shipped -> Delivered).
  - Courier tracking link.
- [ ] **Task 5.2: Customer Order History** (`app/account/orders/page.tsx`)
  - Past and active orders with itemized views.
- [ ] **Task 5.3: Printable PDF / HTML Invoice Generator**
  - Clean branded Shawl Ghar invoice with order number, shop address (Madina Clothes Market Rawalpindi), items, taxes, and COD total.

---

## Milestone 6: Product Variations, Multi-Image Zoom & Inventory Logs
- [ ] **Task 6.1: Product Variation Matrix**
  - Support variations (e.g. Dimensions: *Stole 28x80"*, *Shawl 45x90"*; Colors: *Maroon, Jet Black, Ivory*).
- [ ] **Task 6.2: High-Resolution Image Zoom on Details Page**
  - Interactive hover/tap magnifying zoom for intricate Kashmiri needlework inspection.
- [ ] **Task 6.3: Inventory Movement Audit Logs**
  - Automatically log stock changes (Restock, Order Placed, Order Cancelled, Manual Adjustment).

---

## Milestone 7: Coupons, Promotions & Customer Reviews
- [ ] **Task 7.1: Flexible Coupon Engine**
  - Percentage discount, fixed PKR discount, minimum order threshold, and usage limits.
  - Instant validation API (`/api/coupons/validate`).
- [ ] **Task 7.2: Product Reviews & Rating Submissions**
  - Star ratings, review comments, and verified purchase badge.
  - Admin moderation interface to approve or reject reviews.

---

## Milestone 8: Full Enterprise Admin Dashboard
- [ ] **Task 8.1: Executive Analytics Dashboard** (`/admin`)
  - Graphical sales charts (Daily/Weekly/Monthly revenue in PKR).
  - Summary KPI cards: Total Revenue, Orders by Status, Low Stock Alerts, Total Customers.
- [ ] **Task 8.2: Comprehensive Order Management** (`/admin/orders`)
  - Filter by 10 statuses, update status, view customer notes, assign courier tracking numbers, print invoices.
- [ ] **Task 8.3: Inventory & Stock Adjustment Center** (`/admin/inventory`)
  - Quick stock updates, low-stock threshold alerts, full audit history table.
- [ ] **Task 8.4: Customer CRM & Profile Viewer** (`/admin/customers`)
  - Customer lifetime value, order count, addresses, and order history.
- [ ] **Task 8.5: Coupon & Promotions Manager** (`/admin/coupons`)
  - Create, activate, deactivate, and track redemption of discount codes.

---

## Milestone 9: Testing, Optimization & GitHub/Render Deployment
- [ ] **Task 9.1: Automated End-to-End Verification Script** (`scripts/verify-full-platform.mjs`)
  - Test registration, cart operations, checkout transaction, order placement, stock decrement, admin order status change.
- [ ] **Task 9.2: Production Build & TypeScript Verification**
  - `npx tsc --noEmit` and `npm run build`.
- [ ] **Task 9.3: Commit & Push to GitHub Repository**
  - Push directly to `https://github.com/nasirali786786/Shawltown.git` triggering automated Render production deployment.
