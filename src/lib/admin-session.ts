import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const COOKIE = 'admin_session';

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET must be set (min 16 characters)');
  }
  return new TextEncoder().encode(s);
}

export type AdminSessionPayload = JWTPayload & {
  sub: string;
  username: string;
  fullName: string;
};

export async function createAdminSessionToken(
  adminId: string,
  username: string,
  fullName: string,
): Promise<string> {
  return new SignJWT({ username, fullName })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret());
}

export async function getAdminSession(): Promise<{
  adminId: string;
  username: string;
  fullName: string;
} | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const adminId = payload.sub;
    const username = payload.username;
    const fullName = payload.fullName;
    if (
      typeof adminId !== 'string' ||
      typeof username !== 'string' ||
      typeof fullName !== 'string'
    )
      return null;
    return { adminId, username, fullName };
  } catch {
    return null;
  }
}

export function adminCookieName(): string {
  return COOKIE;
}
