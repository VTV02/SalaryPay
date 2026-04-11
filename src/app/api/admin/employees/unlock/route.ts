import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { denied, adminUsername } = await requireAdmin();
    if (denied) return denied;

    const { workerId } = await req.json();

    if (!workerId) {
      return NextResponse.json({ error: 'Thiếu ID nhân viên' }, { status: 400 });
    }

    const worker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        failedAttempts: 0,
        lockUntil: null
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UNLOCK_WORKER',
        performedBy: adminUsername,
        targetWorker: worker.employeeCode,
        details: 'Mở khóa tài khoản thủ công'
      }
    });

    return NextResponse.json({ message: 'Mở khóa thành công' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi mở khóa nhân viên:', error);
    return NextResponse.json({ error: 'Đã có lỗi phía server' }, { status: 500 });
  }
}
