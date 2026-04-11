import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAdminSessionToken, adminCookieName } from '@/lib/admin-session';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập tài khoản và mật khẩu' }, { status: 400 });
    }

    // 1. Tìm user trong DB
    const admin = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 401 });
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
    }

    // 3. Tạo JWT Token theo chuẩn admin-session
    const token = await createAdminSessionToken(admin.id, admin.username, admin.fullName);

    // 4. Tạo HTTP-only cookie an toàn
    const response = NextResponse.json({ message: 'Đăng nhập thành công', fullName: admin.fullName }, { status: 200 });
    
    response.cookies.set(adminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Đã có lỗi phía server: ' + (error.message || String(error)) }, { status: 500 });
  }
}
