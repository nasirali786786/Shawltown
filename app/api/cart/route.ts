import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getOrCreateCart } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getOrGenerateSessionToken(cookieStore: any): { token: string; isNew: boolean } {
  const existing = cookieStore.get('showltown_cart_token');
  if (existing && existing.value) {
    return { token: existing.value, isNew: false };
  }
  const newToken = 'cart_' + crypto.randomBytes(16).toString('hex');
  return { token: newToken, isNew: true };
}

export async function GET() {
  const cookieStore = await cookies();
  const { token, isNew } = getOrGenerateSessionToken(cookieStore);

  // Check if customer is logged in
  let customerId: number | null = null;
  const custCookie = cookieStore.get('showltown_customer_session');
  if (custCookie && custCookie.value) {
    const payload = verifyToken(custCookie.value);
    if (payload && payload.userId) {
      // Find customer id
      const db = (await import('@/lib/db')).getDatabase();
      const row = db.prepare('SELECT id FROM customers WHERE user_id = ?').get(payload.userId) as any;
      if (row) customerId = row.id;
    }
  }

  const cart = getOrCreateCart(token, customerId);

  const response = NextResponse.json({ cart });

  if (isNew) {
    response.cookies.set({
      name: 'showltown_cart_token',
      value: token,
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response;
}
