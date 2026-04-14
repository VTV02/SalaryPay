import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { denied, adminUsername } = await requireAdmin();
    if (denied) return denied;

    const body = await req.json();
    const workerId = String(body.workerId ?? '').trim();

    if (!workerId) {
      return NextResponse.json({ error: 'Thiếu workerId.' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên.' }, { status: 404 });
    }

    await prisma.worker.update({
      where: { id: workerId },
      data: {
        passwordHash: null,
        mustChangePassword: true,
        failedAttempts: 0,
        lockUntil: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'RESET_PASSWORD',
        performedBy: adminUsername,
        targetWorker: worker.employeeCode,
        details: JSON.stringify({ fullName: worker.fullName }),
      },
    });

    return NextResponse.json({ ok: true, message: `Đã reset mật khẩu cho ${worker.fullName} (${worker.employeeCode}). Mật khẩu mặc định là ngày sinh.` });
  } catch (e: unknown) {
    console.error('Reset password error:', e);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
