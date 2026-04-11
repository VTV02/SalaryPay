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
    const period = parseInt(String(body.period ?? '1'), 10);
    const baseSalary = parseFloat(String(body.baseSalary ?? ''));
    const netSalary = parseFloat(String(body.netSalary ?? ''));
    const details = body.details !== undefined
      ? (typeof body.details === 'string' ? body.details : JSON.stringify(body.details))
      : undefined;

    if (!employeeCode || !monthYear) {
      return NextResponse.json({ error: 'Thiếu mã nhân viên hoặc tháng lương.' }, { status: 400 });
    }
    if (period !== 1 && period !== 2) {
      return NextResponse.json({ error: 'Đợt phải là 1 hoặc 2.' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}$/.test(monthYear)) {
      return NextResponse.json({ error: 'Tháng lương phải đúng định dạng YYYY-MM.' }, { status: 400 });
    }
    if (isNaN(baseSalary) || isNaN(netSalary)) {
      return NextResponse.json({ error: 'Lương cơ bản và thực lãnh phải là số hợp lệ.' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({ where: { employeeCode } });
    if (!worker) {
      return NextResponse.json({ error: `Không tìm thấy mã nhân viên '${employeeCode}'.` }, { status: 404 });
    }

    const existing = await prisma.salary.findUnique({
      where: { workerId_monthYear_period: { workerId: worker.id, monthYear, period } },
    });

    const oldData = existing
      ? { baseSalary: existing.baseSalary.toString(), netSalary: existing.netSalary.toString(), details: existing.details }
      : null;

    await prisma.salary.upsert({
      where: { workerId_monthYear_period: { workerId: worker.id, monthYear, period } },
      update: { baseSalary, netSalary, ...(details !== undefined ? { details } : {}) },
      create: { workerId: worker.id, monthYear, period, baseSalary, netSalary, details: details ?? undefined },
    });

    await prisma.auditLog.create({
      data: {
        action: 'EDIT_SALARY',
        performedBy: adminUsername,
        targetWorker: employeeCode,
        details: JSON.stringify({
          monthYear,
          period,
          workerName: worker.fullName,
          from: oldData,
          to: { baseSalary: String(baseSalary), netSalary: String(netSalary) },
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Đã cập nhật lương tháng ${monthYear} đợt ${period} cho ${employeeCode} - ${worker.fullName}.`,
    });
  } catch (error: unknown) {
    console.error('Edit salary error:', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}
