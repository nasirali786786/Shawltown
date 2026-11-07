import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getUserByEmail, getUserById, User } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'showl-town-super-secure-artisan-secret-key-2026';
const COOKIE_NAME = 'showltown_admin_session';

/**
 * Hash password using PBKDF2 with random or provided salt
 */
export function hashPassword(password: string, existingSalt?: string): string {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify plaintext password against stored salt:hash string
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, hash] = storedHash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
}

/**
 * Create a tamper-proof signed session token
 */
export function signToken(payload: { userId: number; email: string; role: string }): string {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifyToken(token: string): { userId: number; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user from Next.js request cookies
 */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;

  const payload = verifyToken(sessionCookie.value);
  if (!payload || !payload.userId) return null;

  const user = getUserById(payload.userId);
  if (!user) return null;

  return user;
}

/**
 * Check if the current user is an authenticated Admin
 */
export async function requireAdminSession(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role_id !== 1)) {
    return null;
  }
  return user;
}

export { COOKIE_NAME };
