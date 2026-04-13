import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { createSessionToken, sessionCookieName } from '@/lib/session';

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employeeCode = String(body.employeeCode ?? '').trim();
    const dob = String(body.dob ?? '').trim();

    // Validate DD/MM/YYYY format
    if (!employeeCode || !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đủ mã nhân viên và ngày sinh (DD/MM/YYYY).' },
        { status: 400 }
      );
    }

    const worker = await prisma.worker.findUnique({
      where: { employeeCode },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Sai mã nhân viên hoặc mã xác thực.' }, { status: 401 });
    }

    if (worker.lockUntil && worker.lockUntil > new Date()) {
      return NextResponse.json(
        {
          error: `Tài khoản tạm khóa đến ${worker.lockUntil.toISOString()}. Thử lại sau.`,
        },
        { status: 423 }
      );
    }

    const inputHash = crypto.createHash('sha256').update(dob).digest('hex');
    let ok = false;
    if (/^[a-f0-9]{64}$/i.test(worker.dobHash) && inputHash.length === 64) {
      const a = Buffer.from(inputHash, 'hex');
      const b = Buffer.from(worker.dobHash, 'hex');
      ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    if (!ok) {
      const failedAttempts = worker.failedAttempts + 1;
      const lockUntil =
        failedAttempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS) : worker.lockUntil;
      await prisma.worker.update({
        where: { id: worker.id },
        data: { failedAttempts, lockUntil },
      });
      return NextResponse.json({ error: 'Sai mã nhân viên hoặc mã xác thực.' }, { status: 401 });
    }

    await prisma.worker.update({
      where: { id: worker.id },
      data: { failedAttempts: 0, lockUntil: null },
    });

    const token = await createSessionToken(worker.id, worker.employeeCode);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Lỗi không xác định';
    if (message.includes('SESSION_SECRET')) {
      return NextResponse.json({ error: 'Cấu hình server thiếu SESSION_SECRET.' }, { status: 500 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
