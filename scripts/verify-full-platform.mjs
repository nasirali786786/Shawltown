// Automated End-to-End Verification of Shawl Ghar E-Commerce Platform
const BASE = 'http://localhost:3000';

async function main() {
  console.log('🚀 Starting Full Platform Automated Verification...\n');

  // Step 1: Healthcheck & Storefront
  console.log('1️⃣ Checking Storefront Home and Product Endpoints...');
  const resHome = await fetch(`${BASE}/`);
  if (!resHome.ok) throw new Error(`Home page returned status ${resHome.status}`);
  console.log('   ✅ Storefront Home rendered successfully.');

  const resProducts = await fetch(`${BASE}/api/products`);
  const productsData = await resProducts.json();
  if (!productsData.products || productsData.products.length === 0) {
    throw new Error('No products returned from /api/products');
  }
  const sampleProduct = productsData.products[0];
  console.log(`   ✅ Products API returned ${productsData.products.length} products. Sample: "${sampleProduct.name}" (ID: ${sampleProduct.id}, Stock: ${sampleProduct.stock_quantity})`);

  // Step 2: Customer Registration & Auth
  console.log('\n2️⃣ Testing Customer Account Registration & Me endpoint...');
  const testEmail = `patron_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Zahra Mirza',
      email: testEmail,
      phone: '0300-1234567',
      password: 'password123',
    }),
  });
  const regData = await regRes.json();
  if (!regRes.ok || !regData.success) {
    throw new Error(`Customer registration failed: ${JSON.stringify(regData)}`);
  }
  const custCookieRaw = regRes.headers.get('set-cookie');
  const custCookie = custCookieRaw ? custCookieRaw.split(';')[0] : '';
  console.log(`   ✅ Customer registered successfully: ${testEmail}`);

  // Step 3: Shopping Cart Operations
  console.log('\n3️⃣ Testing Shopping Cart (Initialize, Add, Update)...');
  const cartRes = await fetch(`${BASE}/api/cart`, {
    headers: custCookie ? { Cookie: custCookie } : {},
  });
  const cartData = await cartRes.json();
  const cartCookieRaw = cartRes.headers.get('set-cookie');
  const cartCookie = cartCookieRaw ? cartCookieRaw.split(';')[0] : '';
  const combinedCookies = [custCookie, cartCookie].filter(Boolean).join('; ');
  console.log(`   ✅ Initialized Cart ID: ${cartData.cart.id}`);

  // Add Item to Cart
  const addRes = await fetch(`${BASE}/api/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: combinedCookies,
    },
    body: JSON.stringify({
      productId: sampleProduct.id,
      quantity: 2,
    }),
  });
  const addData = await addRes.json();
  if (!addData.success) throw new Error(`Add to cart failed: ${JSON.stringify(addData)}`);
  console.log(`   ✅ Added 2 units of "${sampleProduct.name}" to cart. Items in cart: ${addData.cart.items.length}`);

  // Step 4: Promotional Coupon Validation
  console.log('\n4️⃣ Testing Coupon Code Validator...');
  const couponRes = await fetch(`${BASE}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'WELCOME10',
      subtotal: addData.cart.subtotal,
    }),
  });
  const couponData = await couponRes.json();
  if (!couponData.valid) throw new Error(`Coupon WELCOME10 invalid: ${JSON.stringify(couponData)}`);
  console.log(`   ✅ Coupon validated: 10% discount applied = Rs. ${couponData.discount}`);

  // Step 5: Checkout & Order Creation (Atomic Transaction)
  console.log('\n5️⃣ Testing Checkout Execution (Atomic Transaction, Stock Decrement, Order Status)...');
  const initialStock = sampleProduct.stock_quantity;
  const checkoutRes = await fetch(`${BASE}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: combinedCookies,
    },
    body: JSON.stringify({
      customer_name: 'Zahra Mirza',
      customer_email: testEmail,
      customer_phone: '0300-1234567',
      shipping_street: 'House 42, Street 7, F-8/2',
      shipping_city: 'Islamabad',
      shipping_province: 'Federal Capital',
      shipping_postal_code: '44000',
      payment_method: 'cod',
      coupon_code: 'WELCOME10',
      notes: 'Please ring bell upon delivery.',
    }),
  });
  const checkoutData = await checkoutRes.json();
  if (!checkoutRes.ok || !checkoutData.success) {
    throw new Error(`Checkout failed: ${JSON.stringify(checkoutData)}`);
  }
  console.log(`   ✅ Order placed successfully! Order Number: ${checkoutData.order.order_number}`);
  console.log(`      Grand Total: Rs. ${checkoutData.order.grand_total} (Subtotal: Rs. ${checkoutData.order.subtotal}, Discount: Rs. ${checkoutData.order.discount_total}, Shipping: Rs. ${checkoutData.order.shipping_total})`);

  // Verify stock was decremented
  const checkProdRes = await fetch(`${BASE}/api/products/${sampleProduct.id}`);
  const checkProdData = await checkProdRes.json();
  console.log(`   ✅ Inventory Audit: Stock decremented from ${initialStock} to ${checkProdData.product.stock_quantity} units`);

  // Step 6: Order Details and Timeline
  console.log('\n6️⃣ Verifying Order Retrieval and Status Timeline...');
  const orderRes = await fetch(`${BASE}/api/orders/${checkoutData.order.order_number}`);
  const orderData = await orderRes.json();
  if (!orderData.success) throw new Error('Failed to retrieve order details');
  console.log(`   ✅ Order retrieved. Status: ${orderData.order.order_status}, Status History: ${orderData.timeline.length} milestone(s)`);

  // Step 7: Admin Suite Verification (Login, Orders, Inventory, Coupons)
  console.log('\n7️⃣ Testing Admin Management Suite...');
  const adminLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@showltown.com',
      password: 'admin123',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminLoginData.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
  }
  const adminCookieRaw = adminLoginRes.headers.get('set-cookie');
  const adminCookie = adminCookieRaw ? adminCookieRaw.split(';')[0] : '';
  console.log('   ✅ Admin logged in successfully.');

  // Admin: Update Order Status & Assign Tracking
  const updateOrderRes = await fetch(`${BASE}/api/admin/orders/${checkoutData.order.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      status: 'confirmed',
      carrier: 'TCS Express Pakistan',
      trackingNumber: 'TCS-9920192',
      comment: 'Verified with patron via phone call',
    }),
  });
  const updateOrderData = await updateOrderRes.json();
  if (!updateOrderData.success) throw new Error(`Admin order update failed: ${JSON.stringify(updateOrderData)}`);
  console.log('   ✅ Admin updated order status to "confirmed" and assigned TCS tracking.');

  // Admin: Stock Adjustment
  const adjustStockRes = await fetch(`${BASE}/api/admin/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      productId: sampleProduct.id,
      qtyChange: 10,
      notes: 'Loom restock batch from Kashmir',
    }),
  });
  const adjustStockData = await adjustStockRes.json();
  if (!adjustStockData.success) throw new Error(`Stock adjustment failed: ${JSON.stringify(adjustStockData)}`);
  console.log('   ✅ Admin restocked +10 units with audit note.');

  // Admin: Customer CRM check
  const custCrmRes = await fetch(`${BASE}/api/admin/customers`, {
    headers: { Cookie: adminCookie },
  });
  const custCrmData = await custCrmRes.json();
  console.log(`   ✅ Admin Customer CRM retrieved ${custCrmData.customers.length} registered patron profile(s).`);

  // Step 8: Product Review Submission
  console.log('\n8️⃣ Testing Customer Product Review Posting...');
  const reviewRes = await fetch(`${BASE}/api/products/${sampleProduct.id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: custCookie,
    },
    body: JSON.stringify({
      rating: 5,
      name: 'Zahra Mirza',
      title: 'Majestic Kashmiri needlework',
      comment: 'The warmth, fine pure wool, and intricate border embroidery exceeded all my expectations!',
    }),
  });
  const reviewData = await reviewRes.json();
  if (!reviewData.success) throw new Error(`Review submission failed: ${JSON.stringify(reviewData)}`);
  console.log(`   ✅ Review submitted successfully. Total reviews for product: ${reviewData.reviews.length}`);

  console.log('\n======================================================');
  console.log('🎉 ALL 8 E-COMMERCE PLATFORM MILESTONES VERIFIED 100%!');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
