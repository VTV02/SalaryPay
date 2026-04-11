import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const COOKIE = 'salary_session';

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET must be set (min 16 characters)');
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = JWTPayload & {
  sub: string;
  employeeCode: string;
};

export async function createSessionToken(workerId: string, employeeCode: string): Promise<string> {
  return new SignJWT({ employeeCode })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(workerId)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function getSession(): Promise<{ workerId: string; employeeCode: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const workerId = payload.sub;
    const employeeCode = payload.employeeCode;
    if (typeof workerId !== 'string' || typeof employeeCode !== 'string') return null;
    return { workerId, employeeCode };
  } catch {
    return null;
  }
}

export function sessionCookieName(): string {
  return COOKIE;
}
