import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { denied, adminUsername } = await requireAdmin();
    if (denied) return denied;

    const body = await req.json();
    const employeeCode = String(body.employeeCode ?? '').trim();
    const monthYear = String(body.monthYear ?? '').trim();
    const period = parseInt(String(body.period ?? '0'), 10);

    if (!employeeCode || !monthYear || (period !== 1 && period !== 2)) {
      return NextResponse.json({ error: 'Thiếu thông tin (mã NV, tháng, đợt).' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({ where: { employeeCode } });
    if (!worker) {
      return NextResponse.json({ error: `Không tìm thấy mã NV '${employeeCode}'.` }, { status: 404 });
    }

    const salary = await prisma.salary.findUnique({
      where: { workerId_monthYear_period: { workerId: worker.id, monthYear, period } },
    });

    if (!salary) {
      return NextResponse.json({ error: `Không tìm thấy phiếu lương tháng ${monthYear} đợt ${period}.` }, { status: 404 });
    }

    await prisma.salary.delete({ where: { id: salary.id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_SALARY',
        performedBy: adminUsername,
        targetWorker: employeeCode,
        details: JSON.stringify({
          monthYear,
          period,
          workerName: worker.fullName,
          baseSalary: salary.baseSalary.toString(),
          netSalary: salary.netSalary.toString(),
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Đã xóa phiếu lương tháng ${monthYear} đợt ${period} của ${employeeCode} - ${worker.fullName}.`,
    });
  } catch (error: unknown) {
    console.error('Delete salary error:', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
