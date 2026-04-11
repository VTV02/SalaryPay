import { NextResponse } from 'next/server';
import { adminCookieName } from '@/lib/admin-session';

export async function POST() {
  const response = NextResponse.json({ message: 'Đăng xuất thành công' }, { status: 200 });
  
  // Xóa cookie bằng cách set maxAge = 0
  response.cookies.set(adminCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });

  return response;
}
