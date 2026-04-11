import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { denied, adminUsername } = await requireAdmin();
    if (denied) return denied;

    const body = await req.json();

    const employeeCode = String(body.employeeCode ?? '').trim();
    if (!employeeCode) {
      return NextResponse.json({ error: 'Vui lòng nhập mã nhân viên.' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({ where: { employeeCode } });
    if (!worker) {
      return NextResponse.json({ error: `Không tìm thấy mã nhân viên '${employeeCode}'.` }, { status: 404 });
    }

    await prisma.worker.update({
      where: { id: worker.id },
      data: { failedAttempts: 0, lockUntil: null },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UNLOCK_WORKER',
        performedBy: adminUsername,
        targetWorker: employeeCode,
        details: JSON.stringify({
          workerName: worker.fullName,
          previousFailedAttempts: worker.failedAttempts,
          previousLockUntil: worker.lockUntil?.toISOString() ?? null,
        }),
      },
    });

    return NextResponse.json({ ok: true, message: `Đã mở khóa tài khoản ${employeeCode} - ${worker.fullName}.` });
  } catch (error: unknown) {
    console.error('Unlock worker error:', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
