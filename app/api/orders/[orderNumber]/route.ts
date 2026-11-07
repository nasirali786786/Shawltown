import { NextResponse } from 'next/server';
import { getOrderByNumber, getDatabase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const order = getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const db = getDatabase();
    const history = db
      .prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC')
      .all(order.id);

    return NextResponse.json({
      success: true,
      order,
      history,
      timeline: history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
