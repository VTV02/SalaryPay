import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createAdminSessionToken, adminCookieName } from '@/lib/admin-session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '');

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' },
        { status: 400 },
      );
    }

    const admin = await prisma.adminUser.findUnique({ where: { username } });

    if (!admin) {
      return NextResponse.json(
        { error: 'Sai tên đăng nhập hoặc mật khẩu.' },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, admin.password);

    if (!ok) {
      return NextResponse.json(
        { error: 'Sai tên đăng nhập hoặc mật khẩu.' },
        { status: 401 },
      );
    }

    const token = await createAdminSessionToken(
      admin.id,
      admin.username,
      admin.fullName,
    );

    const res = NextResponse.json({ ok: true });
    res.cookies.set(adminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 giờ
    });
    return res;
  } catch (e: unknown) {
    console.error('Admin login error:', e);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
