import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { updateOrderStatus, updateOrderTracking } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status, comment, carrier, trackingNumber } = body;

    if (status) {
      updateOrderStatus(orderId, status, comment, admin.id);
    }

    if (carrier !== undefined || trackingNumber !== undefined) {
      updateOrderTracking(orderId, carrier || '', trackingNumber || '');
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
