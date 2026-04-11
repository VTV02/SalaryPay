import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

/**
 * Kiểm tra admin session từ cookie.
 * Trả về NextResponse lỗi nếu chưa đăng nhập; ngược lại trả về null + username.
 */
export async function requireAdmin(): Promise<{
  denied: NextResponse | null;
  adminUsername: string;
}> {
  const session = await getAdminSession();
  if (!session) {
    return {
      denied: NextResponse.json(
        { error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' },
        { status: 401 },
      ),
      adminUsername: '',
    };
  }
  return { denied: null, adminUsername: session.username };
}
