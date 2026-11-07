import { NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const authResult = authenticateCustomer(String(email).trim(), String(password));
    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const { user, customer } = authResult;

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'customer',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      customer: {
        id: customer.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loyalty_points: customer.loyalty_points,
      },
    });

    response.cookies.set({
      name: 'showltown_customer_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
