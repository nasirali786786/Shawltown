import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { removeFromCart, getOrCreateCart } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cartItemId = parseInt(id);
    if (isNaN(cartItemId)) {
      return NextResponse.json({ error: 'Invalid cart item ID' }, { status: 400 });
    }

    removeFromCart(cartItemId);

    const cookieStore = await cookies();
    const token = cookieStore.get('showltown_cart_token')?.value;
    const cart = token ? getOrCreateCart(token) : null;

    return NextResponse.json({
      success: true,
      message: 'Item removed from bag',
      cart,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove item' },
      { status: 500 }
    );
  }
}
