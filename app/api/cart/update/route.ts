import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrCreateCart, updateCartQuantity } from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: 'cartItemId and quantity are required' }, { status: 400 });
    }

    updateCartQuantity(parseInt(cartItemId), parseInt(quantity));

    const cookieStore = await cookies();
    const token = cookieStore.get('showltown_cart_token')?.value;
    const cart = token ? getOrCreateCart(token) : null;

    return NextResponse.json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update item quantity' },
      { status: 400 }
    );
  }
}
