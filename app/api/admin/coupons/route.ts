import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { getAllCouponsAdmin, createCoupon, toggleCouponActive, deleteCoupon } from '@/lib/db';

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const coupons = getAllCouponsAdmin();
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error('Failed to get coupons:', error);
    return NextResponse.json({ error: 'Failed to retrieve coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const body = await req.json();
    const { code, description, discount_type, discount_value, min_subtotal, max_discount_cap, usage_limit_total } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: 'Code, discount type, and discount value are required' }, { status: 400 });
    }

    createCoupon({
      code: code.trim().toUpperCase(),
      description: description || '',
      discount_type: discount_type === 'percentage' ? 'percentage' : 'fixed',
      discount_value: parseFloat(discount_value),
      min_subtotal: min_subtotal ? parseFloat(min_subtotal) : 0,
      max_discount_cap: max_discount_cap ? parseFloat(max_discount_cap) : undefined,
      usage_limit_total: usage_limit_total ? parseInt(usage_limit_total, 10) : 100,
    });

    const coupons = getAllCouponsAdmin();
    return NextResponse.json({ success: true, message: 'Coupon created successfully', coupons });
  } catch (error: any) {
    console.error('Failed to create coupon:', error);
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const body = await req.json();
    const { id, is_active, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    if (action === 'delete') {
      deleteCoupon(parseInt(id, 10));
      return NextResponse.json({ success: true, message: 'Coupon deleted' });
    }

    toggleCouponActive(parseInt(id, 10), is_active ? 1 : 0);
    return NextResponse.json({ success: true, message: 'Coupon status updated' });
  } catch (error: any) {
    console.error('Failed to update coupon:', error);
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}
