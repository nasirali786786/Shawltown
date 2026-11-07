import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { getAllCustomersAdmin } from '@/lib/db';

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const customers = getAllCustomersAdmin();
    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Failed to get customers:', error);
    return NextResponse.json({ error: 'Failed to retrieve customers' }, { status: 500 });
  }
}
