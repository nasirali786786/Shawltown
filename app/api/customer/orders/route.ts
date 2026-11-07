import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getDatabase, getCustomerOrders } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('showltown_customer_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const customer = db.prepare('SELECT id FROM customers WHERE user_id = ?').get(payload.userId) as any;
  if (!customer) {
    return NextResponse.json({ orders: [] });
  }

  const orders = getCustomerOrders(customer.id);
  return NextResponse.json({ orders });
}
