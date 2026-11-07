import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrCreateCart, createOrderFromCart, getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_street,
      shipping_city,
      shipping_province,
      shipping_postal_code,
      shipping_method,
      payment_method = 'cod',
      coupon_code,
      notes,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !shipping_street || !shipping_city) {
      return NextResponse.json(
        { error: 'Please provide all required shipping and contact details.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cartToken = cookieStore.get('showltown_cart_token')?.value;

    if (!cartToken) {
      return NextResponse.json(
        { error: 'Your shopping cart session could not be found.' },
        { status: 400 }
      );
    }

    // Check if customer is logged in
    let customerId: number | null = null;
    const custCookie = cookieStore.get('showltown_customer_session')?.value;
    if (custCookie) {
      const payload = verifyToken(custCookie);
      if (payload && payload.userId) {
        const db = getDatabase();
        const row = db.prepare('SELECT id FROM customers WHERE user_id = ?').get(payload.userId) as any;
        if (row) customerId = row.id;
      }
    }

    const cart = getOrCreateCart(cartToken, customerId);

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before checking out.' },
        { status: 400 }
      );
    }

    // Execute atomic order creation transaction
    const order = createOrderFromCart({
      cartId: cart.id,
      customer_id: customerId,
      customer_name: String(customer_name).trim(),
      customer_email: String(customer_email).trim(),
      customer_phone: String(customer_phone).trim(),
      shipping_street: String(shipping_street).trim(),
      shipping_city: String(shipping_city).trim(),
      shipping_province: shipping_province ? String(shipping_province).trim() : 'Punjab',
      shipping_postal_code: shipping_postal_code ? String(shipping_postal_code).trim() : undefined,
      shipping_method: shipping_method || undefined,
      payment_method: payment_method as any,
      coupon_code: coupon_code ? String(coupon_code).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      orderNumber: order.order_number,
      order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Checkout failed to process' },
      { status: 400 }
    );
  }
}
