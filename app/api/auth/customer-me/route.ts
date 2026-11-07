import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getUserById, getDatabase, getCustomerAddresses } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('showltown_customer_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyToken(sessionCookie.value);
  if (!payload || !payload.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = getUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const db = getDatabase();
  const customer = db.prepare('SELECT * FROM customers WHERE user_id = ?').get(user.id) as any;
  const addresses = customer ? getCustomerAddresses(customer.id) : [];

  return NextResponse.json({
    authenticated: true,
    customer: {
      id: customer ? customer.id : null,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      loyalty_points: customer ? customer.loyalty_points : 0,
      addresses,
    },
  });
}
