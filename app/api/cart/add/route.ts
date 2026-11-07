import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getOrCreateCart, addToCart } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, variationId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    let token = cookieStore.get('showltown_cart_token')?.value;
    let isNewToken = false;

    if (!token) {
      token = 'cart_' + crypto.randomBytes(16).toString('hex');
      isNewToken = true;
    }

    const cart = getOrCreateCart(token);
    addToCart(cart.id, parseInt(productId), parseInt(quantity), variationId ? parseInt(variationId) : undefined);

    const updatedCart = getOrCreateCart(token);

    const response = NextResponse.json({
      success: true,
      message: 'Added to your luxury shopping bag!',
      cart: updatedCart,
    });

    if (isNewToken) {
      response.cookies.set({
        name: 'showltown_cart_token',
        value: token,
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add item to bag' },
      { status: 400 }
    );
  }
}
