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
      return NextResponse.json({ error: 'Thiếu mã nhân viên.' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { employeeCode },
      include: { salaries: { select: { id: true } } },
    });

    if (!worker) {
      return NextResponse.json({ error: `Không tìm thấy mã NV '${employeeCode}'.` }, { status: 404 });
    }

    // Delete all salaries first, then delete worker
    await prisma.salary.deleteMany({ where: { workerId: worker.id } });
    await prisma.worker.delete({ where: { id: worker.id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_WORKER',
        performedBy: adminUsername,
        targetWorker: employeeCode,
        details: JSON.stringify({
          fullName: worker.fullName,
          company: worker.company,
          department: worker.department,
          salariesDeleted: worker.salaries.length,
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Đã xóa nhân viên ${employeeCode} — ${worker.fullName} cùng ${worker.salaries.length} phiếu lương.`,
    });
  } catch (error: unknown) {
    console.error('Delete worker error:', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
