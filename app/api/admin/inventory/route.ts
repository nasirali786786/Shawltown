import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { getAllProducts, getInventoryLogs, adjustInventoryStock } from '@/lib/db';

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const products = getAllProducts();
    const logs = getInventoryLogs(50);

    return NextResponse.json({
      success: true,
      products,
      logs,
    });
  } catch (error) {
    console.error('Failed to get inventory:', error);
    return NextResponse.json({ error: 'Failed to retrieve inventory data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, qtyChange, notes } = body;

    if (!productId || qtyChange === undefined || qtyChange === 0) {
      return NextResponse.json({ error: 'Valid product ID and non-zero qtyChange required' }, { status: 400 });
    }

    adjustInventoryStock(
      parseInt(productId, 10),
      parseInt(qtyChange, 10),
      notes || `Stock adjusted by ${admin.name}`
    );

    return NextResponse.json({ success: true, message: 'Stock adjusted successfully' });
  } catch (error: any) {
    console.error('Failed to adjust stock:', error);
    return NextResponse.json({ error: error.message || 'Failed to adjust stock' }, { status: 500 });
  }
}
