import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { getAllOrdersAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const orders = getAllOrdersAdmin(status);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to get orders:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}
