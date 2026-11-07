import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const { user, customer } = registerCustomer({
      name: String(name).trim(),
      email: String(email).trim(),
      password: String(password),
      phone: phone ? String(phone).trim() : undefined,
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'customer',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to Shawl Ghar.',
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
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
