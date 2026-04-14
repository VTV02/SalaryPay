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

    if (!employeeCode || !dob) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đủ mã nhân viên và mật khẩu.' },
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

    function safeCompare(inputHash: string, storedHash: string): boolean {
      if (!/^[a-f0-9]{64}$/i.test(storedHash) || inputHash.length !== 64) return false;
      const a = Buffer.from(inputHash, 'hex');
      const b = Buffer.from(storedHash, 'hex');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    // Nếu đã đổi mật khẩu → check passwordHash, nếu chưa → check dobHash (ngày sinh)
    let ok = false;
    if (worker.passwordHash) {
      // Đã đổi mật khẩu: so sánh SHA256 input trực tiếp với passwordHash
      const inputHash = crypto.createHash('sha256').update(dob).digest('hex');
      ok = safeCompare(inputHash, worker.passwordHash);
    } else {
      // Chưa đổi mật khẩu: thử input trực tiếp, rồi thử auto-format 8 số → DD/MM/YYYY
      const inputHash = crypto.createHash('sha256').update(dob).digest('hex');
      ok = safeCompare(inputHash, worker.dobHash);
      if (!ok) {
        // User nhập 8 số không có / → tự format thành DD/MM/YYYY rồi thử lại
        const digits = dob.replace(/\D/g, '');
        if (digits.length === 8) {
          const formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
          const formattedHash = crypto.createHash('sha256').update(formatted).digest('hex');
          ok = safeCompare(formattedHash, worker.dobHash);
        }
      }
    }

    if (!ok) {
      const failedAttempts = worker.failedAttempts + 1;
      const lockUntil =
        failedAttempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS) : worker.lockUntil;
      await prisma.worker.update({
        where: { id: worker.id },
        data: { failedAttempts, lockUntil },
      });
      return NextResponse.json({ error: 'Sai mã nhân viên hoặc mật khẩu.' }, { status: 401 });
    }

    await prisma.worker.update({
      where: { id: worker.id },
      data: { failedAttempts: 0, lockUntil: null },
    });

    const token = await createSessionToken(worker.id, worker.employeeCode);
    const res = NextResponse.json({ ok: true, mustChangePassword: worker.mustChangePassword });
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
