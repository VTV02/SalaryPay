import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
    }

    const body = await req.json();
    const newPassword = String(body.newPassword ?? '').trim();
    const confirmPassword = String(body.confirmPassword ?? '').trim();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Xác nhận mật khẩu không khớp.' },
        { status: 400 }
      );
    }

    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    await prisma.worker.update({
      where: { id: session.workerId },
      data: { passwordHash, mustChangePassword: false },
    });

    return NextResponse.json({ ok: true, message: 'Đổi mật khẩu thành công.' });
  } catch (e: unknown) {
    console.error('Change password error:', e);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
