import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getDatabase, getCustomerAddresses, addCustomerAddress } from '@/lib/db';

async function getAuthenticatedCustomerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('showltown_customer_session')?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;

  const db = getDatabase();
  const customer = db.prepare('SELECT id FROM customers WHERE user_id = ?').get(payload.userId) as any;
  return customer ? customer.id : null;
}

export async function GET() {
  const customerId = await getAuthenticatedCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const addresses = getCustomerAddresses(customerId);
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const customerId = await getAuthenticatedCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { recipient_name, phone, street_address, apartment, city, province, postal_code, is_default } = body;

    if (!recipient_name || !phone || !street_address || !city || !province) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

    addCustomerAddress({
      customer_id: customerId,
      recipient_name,
      phone,
      street_address,
      apartment,
      city,
      province,
      postal_code,
      is_default,
    });

    const addresses = getCustomerAddresses(customerId);
    return NextResponse.json({ success: true, message: 'Address saved', addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save address' }, { status: 500 });
  }
}
