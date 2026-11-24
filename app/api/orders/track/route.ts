import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { Order, OrderItem } from '@/lib/format';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Please enter your Order Number (e.g. SG-202611-1626) or mobile number.' },
        { status: 400 }
      );
    }

    const clean = query.trim();
    const db = getDatabase();

    // Search by exact order_number OR matching phone
    const order = db
      .prepare(`
        SELECT * FROM orders 
        WHERE UPPER(order_number) = UPPER(?) 
           OR REPLACE(REPLACE(customer_phone, '-', ''), ' ', '') = REPLACE(REPLACE(?, '-', ''), ' ', '')
        ORDER BY id DESC
        LIMIT 1
      `)
      .get(clean, clean) as Order | undefined;

    if (!order) {
      return NextResponse.json(
        {
          error: `No parcel found for "${clean}". Please verify your order number (e.g. SG-202611-...) or phone number.`,
        },
        { status: 404 }
      );
    }

    const items = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(order.id) as OrderItem[];

    const timeline = db
      .prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC')
      .all(order.id);

    return NextResponse.json({
      success: true,
      order,
      items,
      timeline,
    });
  } catch (error: any) {
    console.error('Order tracking lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up order tracking.' }, { status: 500 });
  }
}
