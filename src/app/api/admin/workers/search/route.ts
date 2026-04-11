import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { denied } = await requireAdmin();
    if (denied) return denied;

    const body = await req.json();

    const employeeCode = String(body.employeeCode ?? '').trim();
    if (!employeeCode) {
      return NextResponse.json({ error: 'Vui lòng nhập mã nhân viên.' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { employeeCode },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        company: true,
        failedAttempts: true,
        lockUntil: true,
        salaries: {
          orderBy: [{ monthYear: 'desc' }, { period: 'asc' }],
          select: { id: true, monthYear: true, period: true, baseSalary: true, netSalary: true, details: true },
        },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: `Không tìm thấy mã nhân viên '${employeeCode}'.` }, { status: 404 });
    }

    const isLocked = worker.lockUntil && worker.lockUntil > new Date();

    return NextResponse.json({
      worker: {
        id: worker.id,
        employeeCode: worker.employeeCode,
        fullName: worker.fullName,
        company: worker.company,
        failedAttempts: worker.failedAttempts,
        isLocked,
        lockUntil: worker.lockUntil,
        salaries: worker.salaries,
      },
    });
  } catch (error: unknown) {
    console.error('Search worker error:', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
