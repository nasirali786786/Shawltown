import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProductReviews, createReview, getDatabase, getUserById } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const reviews = getProductReviews(productId);
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Failed to get reviews:', error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await req.json();
    const { rating, name, email, title, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: 'Review comment is required' }, { status: 400 });
    }

    const db = getDatabase();
    let customerId = 1;
    let customerName = (name || '').trim() || 'Verified Connoisseur';

    // Check if customer is logged in
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('showltown_customer_session');
    if (sessionCookie && sessionCookie.value) {
      const payload = verifyToken(sessionCookie.value);
      if (payload && payload.userId) {
        const user = getUserById(payload.userId);
        if (user) {
          const cust = db.prepare('SELECT id FROM customers WHERE user_id = ?').get(user.id) as any;
          if (cust) {
            customerId = cust.id;
          }
          customerName = user.name;
        }
      }
    } else if (email) {
      const existingUser = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
      if (existingUser) {
        const cust = db.prepare('SELECT id FROM customers WHERE user_id = ?').get(existingUser.id) as any;
        if (cust) customerId = cust.id;
        customerName = existingUser.name;
      }
    }

    createReview({
      product_id: productId,
      customer_id: customerId,
      customer_name: customerName,
      rating: Math.round(rating),
      title: title?.trim() || '',
      comment: comment.trim(),
    });

    const reviews = getProductReviews(productId);
    return NextResponse.json({
      success: true,
      message: 'Review published successfully!',
      reviews,
    });
  } catch (error: any) {
    console.error('Failed to post review:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
